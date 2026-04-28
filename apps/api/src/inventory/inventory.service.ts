import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertStoreAccess(userId: string, storeId: string, role: string) {
    if (role === 'SUPER_ADMIN') return;
    const su = await this.prisma.storeUser.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    if (!su) throw new ForbiddenException('No access to this store');
  }

  // ── GET /stores/:storeId/inventory/lots ────────────────────────────────
  async getLots(storeId: string) {
    return this.prisma.inventoryLot.findMany({
      where: { storeId, deletedAt: null },
      orderBy: { receivedAt: 'asc' },
      include: { product: { select: { name: true, sku: true } } },
    });
  }

  // ── POST /stores/:storeId/inventory/lots ───────────────────────────────
  async receiveLot(storeId: string, body: any, user: any) {
    await this.assertStoreAccess(user.userId, storeId, user.role);

    const { productId, lotNumber, quantity, costPerUnit, expiryDate } = body;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create lot
      const lot = await tx.inventoryLot.create({
        data: {
          storeId,
          productId,
          lotNumber: lotNumber ?? null,
          quantity: Number(quantity),
          remaining: Number(quantity),
          costPerUnit: Number(costPerUnit),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
        },
      });

      // 2. Record IN movement
      await tx.stockMovement.create({
        data: {
          lotId: lot.id,
          type: 'RECEIVE',
          quantity: Number(quantity),
          reference: 'LOT_RECEIVE',
        },
      });

      // 3. Update product.stockQuantity
      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: { increment: Number(quantity) } },
      });

      return lot;
    });
  }

  // ── PATCH /stores/:storeId/inventory/lots/:lotId ────────────────────────
  async updateLot(storeId: string, lotId: string, body: any, user: any) {
    await this.assertStoreAccess(user.userId, storeId, user.role);

    const lot = await this.prisma.inventoryLot.findFirst({
      where: { id: lotId, storeId },
    });
    if (!lot) throw new NotFoundException('Lot not found');

    return this.prisma.inventoryLot.update({
      where: { id: lotId },
      data: {
        ...(body.remaining !== undefined && { remaining: Number(body.remaining) }),
        ...(body.expiryDate !== undefined && { expiryDate: body.expiryDate ? new Date(body.expiryDate) : null }),
        ...(body.lotNumber !== undefined && { lotNumber: body.lotNumber }),
      },
    });
  }

  // ── FIFO deduction called from SyncService ──────────────────────────────
  async fifoDeductAndCreateMovements(
    tx: any,
    storeId: string,
    orderId: string,
    productId: string,
    quantityNeeded: number,
    fallbackCost: number
  ): Promise<number> {
    const lots = await tx.inventoryLot.findMany({
      where: { storeId, productId, remaining: { gt: 0 }, deletedAt: null },
      orderBy: { receivedAt: 'asc' },
    });

    let remaining = quantityNeeded;
    let totalCostWeighted = 0;

    for (const lot of lots) {
      if (remaining <= 0) break;
      const deduct = Math.min(lot.remaining, remaining);

      await tx.inventoryLot.update({
        where: { id: lot.id },
        data: { remaining: { decrement: deduct } },
      });

      await tx.stockMovement.create({
        data: {
          lotId: lot.id,
          type: 'SALE',
          quantity: -deduct,
          reference: orderId,
        },
      });

      totalCostWeighted += deduct * Number(lot.costPerUnit);
      remaining -= deduct;
    }

    // Cover any remaining if no lots (no-lot fallback)
    if (remaining > 0) {
      totalCostWeighted += remaining * fallbackCost;
    }

    // Update product.stockQuantity
    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: { decrement: quantityNeeded } },
    });

    return quantityNeeded > 0 ? totalCostWeighted / quantityNeeded : fallbackCost;
  }
}
