import { NotificationStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class GetNotificationParams {
  @IsUUID()
  readonly id!: string;
}

export class GetNotificationOutput {
  @IsUUID()
  readonly id!: string;

  @IsUUID()
  readonly transactionId!: string;

  @IsUUID()
  readonly merchantId!: string;

  @IsString()
  readonly eventType!: string;

  @IsObject()
  readonly payload!: Record<string, unknown>;

  @IsEnum(NotificationStatus)
  readonly status!: NotificationStatus;

  @IsInt()
  @Min(0)
  readonly attempts!: number;

  @IsString()
  readonly createdAt!: string;
}
