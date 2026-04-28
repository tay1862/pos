import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores/:storeId/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  // All authenticated users can read (Owner, Manager, Cashier, Staff)
  findAll(@Param('storeId') storeId: string, @Query('updated_after') updatedAfter?: string) {
    return this.productsService.findAll(storeId, updatedAfter);
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Param('storeId') storeId: string, @Body() createProductDto: any) {
    return this.productsService.create(storeId, createProductDto);
  }

  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('storeId') storeId: string, @Param('id') id: string, @Body() updateProductDto: any) {
    return this.productsService.update(storeId, id, updateProductDto);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.productsService.remove(storeId, id);
  }
}
