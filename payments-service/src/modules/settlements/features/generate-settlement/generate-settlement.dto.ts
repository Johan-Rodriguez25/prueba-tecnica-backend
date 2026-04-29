import { Prisma, SettlementStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class GenerateSettlementInput {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsUUID()
  readonly merchant_id!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  readonly period_start!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  readonly period_end!: string;
}

export class GenerateSettlementOutput {
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

  @ApiProperty()
  readonly transaction_ids!: string[];

  static fromPrisma(args: {
    settlement: {
      id: string;
      merchant_id: string;
      total_amount: Prisma.Decimal;
      transaction_count: number;
      status: SettlementStatus;
      period_start: Date;
      period_end: Date;
    };
    transactionIds: string[];
  }): GenerateSettlementOutput {
    return {
      id: args.settlement.id,
      merchant_id: args.settlement.merchant_id,
      total_amount: args.settlement.total_amount.toString(),
      transaction_count: args.settlement.transaction_count,
      status: args.settlement.status,
      period_start: args.settlement.period_start.toISOString(),
      period_end: args.settlement.period_end.toISOString(),
      transaction_ids: args.transactionIds,
    };
  }
}
