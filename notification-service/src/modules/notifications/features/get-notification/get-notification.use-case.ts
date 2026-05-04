import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type {
  GetNotificationOutput,
  GetNotificationParams,
} from './get-notification.dto';

@Injectable()
export class GetNotificationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: GetNotificationParams): Promise<GetNotificationOutput> {
    const id = params.id.trim();

    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('notification not found');
    }

    return {
      id: notification.id,
      transactionId: notification.transaction_id,
      merchantId: notification.merchant_id,
      eventType: notification.event_type,
      payload: notification.payload as Record<string, unknown>,
      status: notification.status,
      attempts: notification.attempts,
      createdAt: notification.created_at.toISOString(),
    };
  }
}
