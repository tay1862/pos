import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type ReportOptions = {
  startDate?: string;
  endDate?: string;
  staffId?: string;
  paymentMethod?: string;
  limit?: number;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helper: verify access ──────────────────────────────────────────────
  private async verifyStoreAccess(storeId: string, userId: string) {
    // In our schema, user relation to store is via store_users
    const access = await this.prisma.storeUser.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    if (!access) {
      throw new ForbiddenException('You do not have access to this store reports');
    }
  }

  // ── Helper: build date where conditions ──────────────────────────────
  private dateWhere(storeId: string, opts: ReportOptions) {
    const where: any = {
      storeId,
      deletedAt: null,
      status: 'PAID',
    };

    if (opts.startDate || opts.endDate) {
      where.createdAt = {
        ...(opts.startDate && { gte: new Date(opts.startDate + 'T00:00:00Z') }),
        ...(opts.endDate && { lte: new Date(opts.endDate + 'T23:59:59Z') }),
      };
    }

    if (opts.staffId) where.staffId = opts.staffId;

    return where;
  }

  // ── Summary ───────────────────────────────────────────────────────────
  async getSummary(storeId: string, userId: string, opts: ReportOptions) {
    await this.verifyStoreAccess(storeId, userId);
    const where = this.dateWhere(storeId, opts);

    const [ordersAgg, itemsAgg] = await Promise.all([
      this.prisma.order.aggregate({
        where,
        _count: { id: true },
        _sum: { total: true },
      }),
      this.prisma.orderItem.aggregate({
        where: { order: where },
        _sum: { quantity: true, cost: true, total: true },
      }),
    ]);

    const revenue = Number(ordersAgg._sum.total ?? 0);
    // cost = sum(cost * quantity) – stored as weighted cost in cost field per item
    // We approximate cost * qty from orderItem.cost (which is weighted cost per unit)
    const costPerUnit = Number(itemsAgg._sum.cost ?? 0);
    const totalQty = Number(itemsAgg._sum.quantity ?? 0);
    // Better: use raw query for sum(cost * quantity)
    const costRaw = await this.prisma.$queryRaw<[{ total_cost: number }]>`
      SELECT COALESCE(SUM(oi.cost * oi.quantity), 0) AS total_cost
      FROM order_items oi
      JOIN orders o ON o.id = oi."order_id"
      WHERE o."store_id" = ${storeId}
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
        ${opts.startDate ? Prisma.sql`AND o."created_at" >= ${new Date(opts.startDate + 'T00:00:00Z')}` : Prisma.empty}
        ${opts.endDate ? Prisma.sql`AND o."created_at" <= ${new Date(opts.endDate + 'T23:59:59Z')}` : Prisma.empty}
    `;

    const totalCost = Number(costRaw[0]?.total_cost ?? 0);
    const grossProfit = revenue - totalCost;

    return {
      totalOrders: ordersAgg._count.id,
      totalRevenue: revenue,
      totalCost,
      grossProfit,
      totalItemsSold: totalQty,
      grossMarginPct: revenue > 0 ? Math.round((grossProfit / revenue) * 100) : 0,
    };
  }

  // ── Top Products ──────────────────────────────────────────────────────
  async getTopProducts(storeId: string, userId: string, opts: ReportOptions) {
    await this.verifyStoreAccess(storeId, userId);
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        oi."product_id"                            AS "productId",
        oi.name,
        SUM(oi.quantity)::int                      AS "quantitySold",
        COALESCE(SUM(oi.total), 0)::float          AS "totalRevenue",
        COALESCE(SUM(oi.cost * oi.quantity),0)::float AS "totalCost",
        COALESCE(SUM(oi.total) - SUM(oi.cost * oi.quantity),0)::float AS "grossProfit"
      FROM order_items oi
      JOIN orders o ON o.id = oi."order_id"
      WHERE o."store_id" = ${storeId}
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
        ${opts.startDate ? Prisma.sql`AND o."created_at" >= ${new Date(opts.startDate + 'T00:00:00Z')}` : Prisma.empty}
        ${opts.endDate ? Prisma.sql`AND o."created_at" <= ${new Date(opts.endDate + 'T23:59:59Z')}` : Prisma.empty}
      GROUP BY oi."product_id", oi.name
      ORDER BY "quantitySold" DESC
      LIMIT ${opts.limit ?? 10}
    `;
    return rows;
  }

  // ── Payment Breakdown ─────────────────────────────────────────────────
  async getPaymentBreakdown(storeId: string, userId: string, opts: ReportOptions) {
    await this.verifyStoreAccess(storeId, userId);
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        p.method,
        COUNT(*)::int                    AS count,
        COALESCE(SUM(p.amount),0)::float AS total
      FROM payments p
      JOIN orders o ON o.id = p."order_id"
      WHERE o."store_id" = ${storeId}
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
        AND p.status = 'COMPLETED'
        ${opts.startDate ? Prisma.sql`AND o."created_at" >= ${new Date(opts.startDate + 'T00:00:00Z')}` : Prisma.empty}
        ${opts.endDate ? Prisma.sql`AND o."created_at" <= ${new Date(opts.endDate + 'T23:59:59Z')}` : Prisma.empty}
      GROUP BY p.method
      ORDER BY total DESC
    `;

    const grandTotal = rows.reduce((s, r) => s + r.total, 0);
    return rows.map(r => ({
      ...r,
      percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0,
    }));
  }

  // ── Monthly ───────────────────────────────────────────────────────────
  async getMonthlySummary(storeId: string, userId: string, year: number) {
    await this.verifyStoreAccess(storeId, userId);
    return this.prisma.$queryRaw<any[]>`
      SELECT
        TO_CHAR(o."created_at" AT TIME ZONE 'UTC', 'YYYY-MM') AS date,
        COUNT(DISTINCT o.id)::int                  AS "totalOrders",
        COALESCE(SUM(o.total),0)::float            AS "totalRevenue",
        COALESCE(SUM(oi.cost * oi.quantity),0)::float AS "totalCost",
        COALESCE(SUM(o.total) - SUM(oi.cost * oi.quantity),0)::float AS "grossProfit",
        COALESCE(SUM(oi.quantity),0)::int          AS "totalItemsSold"
      FROM orders o
      LEFT JOIN order_items oi ON oi."order_id" = o.id
      WHERE o."store_id" = ${storeId}
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
        AND EXTRACT(YEAR FROM o."created_at" AT TIME ZONE 'UTC') = ${year}
      GROUP BY TO_CHAR(o."created_at" AT TIME ZONE 'UTC', 'YYYY-MM')
      ORDER BY date ASC
    `;
  }

  // ── Daily Trend ───────────────────────────────────────────────────────
  async getDailyTrend(storeId: string, userId: string, opts: ReportOptions) {
    await this.verifyStoreAccess(storeId, userId);
    return this.prisma.$queryRaw<any[]>`
      SELECT
        TO_CHAR(o."created_at" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        COALESCE(SUM(o.total),0)::float       AS revenue,
        COUNT(DISTINCT o.id)::int             AS orders
      FROM orders o
      WHERE o."store_id" = ${storeId}
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
        ${opts.startDate ? Prisma.sql`AND o."created_at" >= ${new Date(opts.startDate + 'T00:00:00Z')}` : Prisma.empty}
        ${opts.endDate ? Prisma.sql`AND o."created_at" <= ${new Date(opts.endDate + 'T23:59:59Z')}` : Prisma.empty}
      GROUP BY TO_CHAR(o."created_at" AT TIME ZONE 'UTC', 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
  }
}
