import {
  Currency,
  SettlementStatus,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

export class GetSettlementDetailsParams {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsUUID()
  readonly id!: string;
}

export class SettlementTransactionItemOutput {
  @ApiProperty()
  @IsString()
  readonly id!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly merchant_id!: string;

  @ApiProperty({ example: '125.50' })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  readonly amount!: string;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  readonly currency!: Currency;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  readonly type!: TransactionType;

  @ApiProperty({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  readonly status!: TransactionStatus;

  @ApiProperty()
  @IsString()
  readonly reference!: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, unknown>;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  readonly created_at!: string;
}

export class GetSettlementDetailsOutput {
  @ApiProperty()
  @IsString()
  readonly id!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly merchant_id!: string;

  @ApiProperty({ example: '1000.50' })
  @IsString()
  readonly total_amount!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly transaction_count!: number;

  @ApiProperty({ enum: SettlementStatus })
  @IsEnum(SettlementStatus)
  readonly status!: SettlementStatus;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  readonly period_start!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  readonly period_end!: string;

  @ApiProperty({ type: [SettlementTransactionItemOutput] })
  readonly transactions!: SettlementTransactionItemOutput[];
}
