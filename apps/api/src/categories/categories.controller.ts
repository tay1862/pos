import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores/:storeId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  // All authenticated users can read (Owner, Manager, Cashier, Staff)
  findAll(@Param('storeId') storeId: string, @Query('updated_after') updatedAfter?: string) {
    return this.categoriesService.findAll(storeId, updatedAfter);
  }

  @Post()
  @Roles('OWNER', 'MANAGER')
  create(@Param('storeId') storeId: string, @Body() createCategoryDto: any) {
    return this.categoriesService.create(storeId, createCategoryDto);
  }

  @Patch(':id')
  @Roles('OWNER', 'MANAGER')
  update(@Param('storeId') storeId: string, @Param('id') id: string, @Body() updateCategoryDto: any) {
    return this.categoriesService.update(storeId, id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles('OWNER', 'MANAGER')
  remove(@Param('storeId') storeId: string, @Param('id') id: string) {
    return this.categoriesService.remove(storeId, id);
  }
}
