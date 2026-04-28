import { Controller, Post, Body, Get, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('owner-login')
  async login(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new UnauthorizedException('Email and password are required');
    }
    return this.authService.ownerLogin(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'SUPER_ADMIN')
  @Get('staff/:storeId')
  async getStoreStaff(@Param('storeId') storeId: string) {
    return this.authService.getStaffForStore(storeId);
  }
}
