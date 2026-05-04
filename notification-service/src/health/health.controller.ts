import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async get() {
    try {
      const prisma = this.prisma as unknown as {
        $queryRawUnsafe: (query: string) => Promise<unknown>;
      };
      await prisma.$queryRawUnsafe('SELECT 1');
      return {
        status: 'ok',
        service: 'notification-service',
        uptime: Math.floor(process.uptime()),
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'notification-service',
        uptime: Math.floor(process.uptime()),
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
