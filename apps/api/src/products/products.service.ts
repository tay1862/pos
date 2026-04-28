import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId: string, updatedAfter?: string) {
    const where: any = { storeId };
    
    if (updatedAfter) {
      where.updatedAt = { gte: new Date(updatedAfter) };
    } else {
      where.deletedAt = null; // Only fetch active initially
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(storeId: string, data: any) {
    return this.prisma.product.create({
      data: {
        ...data,
        storeId,
      },
    });
  }

  async update(storeId: string, id: string, data: any) {
    const product = await this.prisma.product.findFirst({
      where: { id, storeId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(storeId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, storeId, deletedAt: null },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
