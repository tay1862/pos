import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async ownerLogin(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        stores: {
          include: { store: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Use bcrypt for secure password comparison
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      stores: user.stores.map((su) => ({
        id: su.store.id,
        name: su.store.name,
        currency: su.store.currency,
        role: su.role,
      })),
    };
  }

  async getStaffForStore(storeId: string) {
    return this.prisma.staff.findMany({
      where: { storeId, isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        pinHash: true,
        isActive: true,
        updatedAt: true,
      }
    });
  }
}
