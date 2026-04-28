import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
    const totalQty = Number(itemsAgg._sum.quantity ?? 0);

    // Build raw query for cost
    let query = `
      SELECT COALESCE(SUM(oi.cost * oi.quantity), 0) AS total_cost
      FROM order_items oi
      JOIN orders o ON o.id = oi."order_id"
      WHERE o."store_id" = $1
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
    `;
    const params: any[] = [storeId];

    if (opts.startDate) {
      params.push(new Date(opts.startDate + 'T00:00:00Z'));
      query += ` AND o."created_at" >= $${params.length}`;
    }
    if (opts.endDate) {
      params.push(new Date(opts.endDate + 'T23:59:59Z'));
      query += ` AND o."created_at" <= $${params.length}`;
    }

    const costRaw = (await this.prisma.$queryRawUnsafe(query, ...params)) as [{ total_cost: number }];

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
    
    let query = `
      SELECT
        oi."product_id"                            AS "productId",
        oi.name,
        SUM(oi.quantity)::int                      AS "quantitySold",
        COALESCE(SUM(oi.total), 0)::float          AS "totalRevenue",
        COALESCE(SUM(oi.cost * oi.quantity),0)::float AS "totalCost",
        COALESCE(SUM(oi.total) - SUM(oi.cost * oi.quantity),0)::float AS "grossProfit"
      FROM order_items oi
      JOIN orders o ON o.id = oi."order_id"
      WHERE o."store_id" = $1
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
    `;
    const params: any[] = [storeId];

    if (opts.startDate) {
      params.push(new Date(opts.startDate + 'T00:00:00Z'));
      query += ` AND o."created_at" >= $${params.length}`;
    }
    if (opts.endDate) {
      params.push(new Date(opts.endDate + 'T23:59:59Z'));
      query += ` AND o."created_at" <= $${params.length}`;
    }

    query += `
      GROUP BY oi."product_id", oi.name
      ORDER BY "quantitySold" DESC
      LIMIT $${params.length + 1}
    `;
    params.push(opts.limit ?? 10);

    return (await this.prisma.$queryRawUnsafe(query, ...params)) as any[];
  }

  // ── Payment Breakdown ─────────────────────────────────────────────────
  async getPaymentBreakdown(storeId: string, userId: string, opts: ReportOptions) {
    await this.verifyStoreAccess(storeId, userId);
    
    let query = `
      SELECT
        p.method,
        COUNT(*)::int                    AS count,
        COALESCE(SUM(p.amount),0)::float AS total
      FROM payments p
      JOIN orders o ON o.id = p."order_id"
      WHERE o."store_id" = $1
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
        AND p.status = 'COMPLETED'
    `;
    const params: any[] = [storeId];

    if (opts.startDate) {
      params.push(new Date(opts.startDate + 'T00:00:00Z'));
      query += ` AND o."created_at" >= $${params.length}`;
    }
    if (opts.endDate) {
      params.push(new Date(opts.endDate + 'T23:59:59Z'));
      query += ` AND o."created_at" <= $${params.length}`;
    }

    query += `
      GROUP BY p.method
      ORDER BY total DESC
    `;

    const rows = (await this.prisma.$queryRawUnsafe(query, ...params)) as any[];

    const grandTotal = rows.reduce((s, r) => s + r.total, 0);
    return rows.map(r => ({
      ...r,
      percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0,
    }));
  }

  // ── Monthly ───────────────────────────────────────────────────────────
  async getMonthlySummary(storeId: string, userId: string, year: number) {
    await this.verifyStoreAccess(storeId, userId);
    const query = `
      SELECT
        TO_CHAR(o."created_at" AT TIME ZONE 'UTC', 'YYYY-MM') AS date,
        COUNT(DISTINCT o.id)::int                  AS "totalOrders",
        COALESCE(SUM(o.total),0)::float            AS "totalRevenue",
        COALESCE(SUM(oi.cost * oi.quantity),0)::float AS "totalCost",
        COALESCE(SUM(o.total) - SUM(oi.cost * oi.quantity),0)::float AS "grossProfit",
        COALESCE(SUM(oi.quantity),0)::int          AS "totalItemsSold"
      FROM orders o
      LEFT JOIN order_items oi ON oi."order_id" = o.id
      WHERE o."store_id" = $1
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
        AND EXTRACT(YEAR FROM o."created_at" AT TIME ZONE 'UTC') = $2
      GROUP BY TO_CHAR(o."created_at" AT TIME ZONE 'UTC', 'YYYY-MM')
      ORDER BY date ASC
    `;
    return (await this.prisma.$queryRawUnsafe(query, storeId, year)) as any[];
  }

  // ── Daily Trend ───────────────────────────────────────────────────────
  async getDailyTrend(storeId: string, userId: string, opts: ReportOptions) {
    await this.verifyStoreAccess(storeId, userId);
    
    let query = `
      SELECT
        TO_CHAR(o."created_at" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        COALESCE(SUM(o.total),0)::float       AS revenue,
        COUNT(DISTINCT o.id)::int             AS orders
      FROM orders o
      WHERE o."store_id" = $1
        AND o."deleted_at" IS NULL
        AND o.status = 'PAID'
    `;
    const params: any[] = [storeId];

    if (opts.startDate) {
      params.push(new Date(opts.startDate + 'T00:00:00Z'));
      query += ` AND o."created_at" >= $${params.length}`;
    }
    if (opts.endDate) {
      params.push(new Date(opts.endDate + 'T23:59:59Z'));
      query += ` AND o."created_at" <= $${params.length}`;
    }

    query += `
      GROUP BY TO_CHAR(o."created_at" AT TIME ZONE 'UTC', 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    return (await this.prisma.$queryRawUnsafe(query, ...params)) as any[];
  }
}
