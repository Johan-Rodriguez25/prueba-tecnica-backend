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
  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Filtro opcional por merchant (exact match). Útil para listar las transacciones de un merchant.',
  })
  @IsOptional()
  @IsUUID()
  readonly merchantId?: string;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  readonly status?: TransactionStatus;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  readonly type?: TransactionType;

  @ApiPropertyOptional({ enum: Currency })
  @IsOptional()
  @IsEnum(Currency)
  readonly currency?: Currency;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  readonly reference?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  readonly createdFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  readonly createdTo?: string;

  @ApiPropertyOptional({ example: '10.00' })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,2})?$/)
  readonly minAmount?: string;

  @ApiPropertyOptional({ example: '250.00' })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,2})?$/)
  readonly maxAmount?: string;

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
  readonly pageSize?: number;
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

export class GetTransactionsOutput {
  @ApiProperty({ type: [TransactionListItemOutput] })
  readonly items!: TransactionListItemOutput[];

  @ApiProperty()
  @IsInt()
  @Min(1)
  readonly page!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  readonly pageSize!: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly total!: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  readonly totalPages!: number;
}
