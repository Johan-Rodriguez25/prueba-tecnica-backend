import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type {
  GetNotificationsOutput,
  GetNotificationsQuery,
} from './get-notifications.dto';

@Injectable()
export class GetNotificationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetNotificationsQuery): Promise<GetNotificationsOutput> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({
        where: { merchant_id: query.merchantId },
      }),
      this.prisma.notification.findMany({
        where: { merchant_id: query.merchantId },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: notifications.map((n) => ({
        id: n.id,
        transactionId: n.transaction_id,
        merchantId: n.merchant_id,
        eventType: n.event_type,
        payload: n.payload as Record<string, unknown>,
        status: n.status,
        attempts: n.attempts,
        createdAt: n.created_at.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        total_pages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }
}
