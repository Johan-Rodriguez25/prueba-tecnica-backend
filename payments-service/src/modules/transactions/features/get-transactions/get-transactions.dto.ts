import { Currency, TransactionStatus, TransactionType } from '@prisma/client';
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
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetTransactionsInput {
  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  readonly status?: TransactionStatus;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  readonly type?: TransactionType;

  @ApiPropertyOptional({ name: 'date_from', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  readonly date_from?: string;

  @ApiPropertyOptional({ name: 'date_to', format: 'date-time' })
  @IsOptional()
  @IsDateString()
  readonly date_to?: string;

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

export class TransactionListItemOutput {
  @ApiProperty()
  @IsString()
  readonly id!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly merchantId!: string;

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
  readonly createdAt!: string;
}

export class GetTransactionsMetaOutput {
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

export class GetTransactionsOutput {
  @ApiProperty({ type: [TransactionListItemOutput] })
  readonly data!: TransactionListItemOutput[];

  @ApiProperty({ type: GetTransactionsMetaOutput })
  readonly meta!: GetTransactionsMetaOutput;
}
