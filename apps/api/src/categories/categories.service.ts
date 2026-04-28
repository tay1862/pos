import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(storeId: string, updatedAfter?: string) {
    const where: any = { storeId };
    
    if (updatedAfter) {
      where.updatedAt = { gte: new Date(updatedAfter) };
    } else {
      where.deletedAt = null; // Only fetch active initially
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(storeId: string, data: any) {
    return this.prisma.category.create({
      data: {
        ...data,
        storeId,
      },
    });
  }

  async update(storeId: string, id: string, data: any) {
    const category = await this.prisma.category.findFirst({
      where: { id, storeId, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(storeId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, storeId, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Category not found');

    // Soft delete
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
