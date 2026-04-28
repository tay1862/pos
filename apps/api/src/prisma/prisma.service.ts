import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@my-pos/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
