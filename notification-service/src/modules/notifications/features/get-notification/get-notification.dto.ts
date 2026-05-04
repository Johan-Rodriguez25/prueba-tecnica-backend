import { NotificationStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class GetNotificationParams {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly id!: string;
}

export class GetNotificationOutput {
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
