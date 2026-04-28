import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('stores/:storeId/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** GET /stores/:storeId/reports/summary?startDate=&endDate= */
  @Get('summary')
  getSummary(
    @Param('storeId') storeId: string,
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('staffId') staffId?: string,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.reportsService.getSummary(storeId, req.user.userId, { startDate, endDate, staffId, paymentMethod });
  }

  /** GET /stores/:storeId/reports/top-products?startDate=&endDate=&limit= */
  @Get('top-products')
  getTopProducts(
    @Param('storeId') storeId: string,
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getTopProducts(storeId, req.user.userId, {
      startDate, endDate, limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  /** GET /stores/:storeId/reports/payments?startDate=&endDate= */
  @Get('payments')
  getPaymentBreakdown(
    @Param('storeId') storeId: string,
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPaymentBreakdown(storeId, req.user.userId, { startDate, endDate });
  }

  /** GET /stores/:storeId/reports/monthly?year= */
  @Get('monthly')
  getMonthly(
    @Param('storeId') storeId: string,
    @Req() req: any,
    @Query('year') year?: string,
  ) {
    return this.reportsService.getMonthlySummary(storeId, req.user.userId, year ? parseInt(year, 10) : new Date().getFullYear());
  }

  /** GET /stores/:storeId/reports/daily-trend?startDate=&endDate= */
  @Get('daily-trend')
  getDailyTrend(
    @Param('storeId') storeId: string,
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getDailyTrend(storeId, req.user.userId, { startDate, endDate });
  }
}
