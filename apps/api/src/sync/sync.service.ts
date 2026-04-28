import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async processPush(user: any, payload: any) {
    const successQueueIds: string[] = [];
    const failedQueueIds: { queueId: string; error: string }[] = [];

    // The JWT might contain storeId if it's a staff login, or user might be owner
    const userStoreId = user.storeId; 

    if (payload.orders && Array.isArray(payload.orders)) {
      for (const orderData of payload.orders) {
        const { queueId, idempotencyKey, order, items, payments } = orderData;
        
        try {
          if (!order || !order.store_id) {
            throw new Error('Invalid order payload');
          }

          // Database Transaction for the entire order
          await this.prisma.$transaction(async (tx) => {
            // Validate access
            if (user.role !== 'SUPER_ADMIN') {
              const storeUser = await tx.storeUser.findUnique({
                where: {
                  userId_storeId: {
                    userId: user.userId,
                    storeId: order.store_id
                  }
                }
              });

              if (!storeUser) {
                throw new Error('Unauthorized store access');
              }
            }

            // 1. Check idempotency
            const existingSyncEvent = await tx.syncEvent.findUnique({
              where: {
                idempotencyKey: idempotencyKey
              }
            });

            if (existingSyncEvent) {
              // Already processed successfully, just return success so mobile marks as done
              this.logger.log(`Idempotency hit for ${idempotencyKey}. Skipping.`);
              return;
            }

            // 2. Validate Totals
            const calculatedItemsTotal = items.reduce((sum: number, item: any) => sum + Number(item.total), 0);
            const orderTotal = Number(order.total);
            const paymentsTotal = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

            // Using Math.abs to account for float precision issues
            if (Math.abs(calculatedItemsTotal - orderTotal) > 0.05) {
              throw new Error(`Items total (${calculatedItemsTotal}) does not match order total (${orderTotal})`);
            }

            if (Math.abs(paymentsTotal - orderTotal) > 0.05) {
              throw new Error(`Payments total (${paymentsTotal}) does not match order total (${orderTotal})`);
            }

            // 3. Create Order
            // Use upsert or create? create since idempotency handles duplicates
            await tx.order.create({
              data: {
                id: order.id,
                storeId: order.store_id,
                deviceId: order.device_id,
                staffId: order.staff_id,
                customerId: order.customer_id,
                ticketId: order.ticket_id,
                orderNumber: order.order_number,
                subtotal: order.subtotal,
                discountType: order.discount_type || null,
                discountValue: order.discount_value || 0,
                discountTotal: order.discount_total || 0,
                taxTotal: order.tax_total || 0,
                total: order.total,
                status: order.status || 'PAID',
                note: order.note || null,
                localId: order.id,
                createdAt: new Date(order.created_at),
                updatedAt: new Date(order.updated_at || order.created_at)
              }
            });

            // 4. Create Order Items + FIFO deduction per product
            if (items && items.length > 0) {
              for (const item of items) {
                // FIFO deduction on backend (idempotent — SyncEvent prevents re-run)
                let actualCost = Number(item.cost || 0);

                const product = await tx.product.findUnique({
                  where: { id: item.product_id },
                  select: { trackStock: true, cost: true },
                });

                if (product?.trackStock) {
                  actualCost = await this.inventoryService.fifoDeductAndCreateMovements(
                    tx,
                    order.store_id,
                    order.id,
                    item.product_id,
                    item.quantity,
                    Number(product.cost),
                  );
                }

                await tx.orderItem.create({
                  data: {
                    id: item.id,
                    orderId: order.id,
                    productId: item.product_id,
                    name: item.name || item.product_name,
                    quantity: item.quantity,
                    price: item.price || item.unit_price,
                    total: item.total,
                    cost: actualCost,
                    note: item.note || null,
                    discountType: item.discount_type || null,
                    discountValue: item.discount_value || 0,
                    discountTotal: item.discount_total || 0,
                    taxTotal: item.tax_total || 0,
                  },
                });
              }
            }

            // 5. Create Payments
            if (payments && payments.length > 0) {
              await tx.payment.createMany({
                data: payments.map((payment: any) => ({
                  id: payment.id,
                  orderId: order.id,
                  method: payment.method || 'CASH',
                  amount: payment.amount,
                  receivedAmount: payment.received_amount || payment.received || 0,
                  changeAmount: payment.change_amount || payment.change || 0,
                  referenceNote: payment.reference_note || payment.reference || null,
                  note: payment.note || null,
                  status: payment.status || 'COMPLETED',
                  createdAt: new Date(payment.created_at)
                }))
              });
            }

            // 6. Update Ticket — use PAID to match mobile
            if (order.ticket_id) {
              await tx.ticket.updateMany({
                where: { id: order.ticket_id },
                data: { status: 'PAID', updatedAt: new Date() },
              });
            }

            // 7. Insert SyncEvent
            await tx.syncEvent.create({
              data: {
                storeId: order.store_id,
                deviceId: order.device_id,
                idempotencyKey: idempotencyKey,
                entityType: 'order',
                entityId: order.id,
                status: 'COMPLETED'
              }
            });
          });

          // Transaction successful
          successQueueIds.push(queueId);

        } catch (error: any) {
          this.logger.error(`Failed to process queueId ${queueId}: ${error.message}`);
          failedQueueIds.push({ queueId, error: error.message });
        }
      }
    }

    return {
      successQueueIds,
      failedQueueIds
    };
  }
}
