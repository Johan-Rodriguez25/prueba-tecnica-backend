import { NotificationStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly merchantId!: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number;
}

export class NotificationListItemOutput {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly id!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly transactionId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly merchantId!: string;

  @ApiProperty()
  @IsString()
  readonly eventType!: string;

  @ApiProperty({ type: Object })
  @IsObject()
  readonly payload!: Record<string, unknown>;

  @ApiProperty({ enum: NotificationStatus })
  @IsEnum(NotificationStatus)
  readonly status!: NotificationStatus;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  readonly attempts!: number;

  @ApiProperty({ format: 'date-time' })
  @IsString()
  readonly createdAt!: string;
}

export class GetNotificationsMetaOutput {
  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly total!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  readonly page!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit!: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly total_pages!: number;
}

export class GetNotificationsOutput {
  @ApiProperty({ type: [NotificationListItemOutput] })
  readonly data!: NotificationListItemOutput[];

  @ApiProperty({ type: GetNotificationsMetaOutput })
  readonly meta!: GetNotificationsMetaOutput;
}
