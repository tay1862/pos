import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @UseGuards(JwtAuthGuard)
  @Post('push')
  async pushData(@Req() req: any, @Body() payload: any) {
    // req.user has the store context from JWT
    return this.syncService.processPush(req.user, payload);
  }
}
