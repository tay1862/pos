import {
  Controller, Get, Post, Patch,
  Param, Body, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@Controller('stores/:storeId/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /** List all lots for a store (optionally filter by productId query) */
  @Get('lots')
  getLots(@Param('storeId') storeId: string) {
    return this.inventoryService.getLots(storeId);
  }

  /** Receive a new stock lot */
  @Post('lots')
  receiveLot(@Param('storeId') storeId: string, @Body() body: any, @Req() req: any) {
    return this.inventoryService.receiveLot(storeId, body, req.user);
  }

  /** Adjust or close a lot */
  @Patch('lots/:lotId')
  updateLot(
    @Param('storeId') storeId: string,
    @Param('lotId') lotId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.inventoryService.updateLot(storeId, lotId, body, req.user);
  }
}
