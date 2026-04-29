import { Currency, TransactionStatus, TransactionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateTransactionInput {
  @ApiProperty({ format: 'uuid' })
  @IsString()
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

  @ApiProperty({ example: 'ref-001' })
  @IsString()
  readonly reference!: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, unknown>;
}

export class CreateTransactionOutput {
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

  @ApiProperty()
  @IsDate()
  readonly createdAt!: Date;

  @ApiProperty()
  @IsDate()
  readonly updatedAt!: Date;
}
