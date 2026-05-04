import { NotificationStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class GetNotificationsQuery {
  @IsUUID()
  readonly merchantId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number;
}

export class NotificationListItemOutput {
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

export class GetNotificationsMetaOutput {
  @IsInt()
  @Min(0)
  readonly total!: number;

  @IsInt()
  @Min(1)
  readonly page!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit!: number;

  @IsInt()
  @Min(0)
  readonly total_pages!: number;
}

export class GetNotificationsOutput {
  readonly data!: NotificationListItemOutput[];
  readonly meta!: GetNotificationsMetaOutput;
}
