import { Currency, TransactionStatus, TransactionType } from '@prisma/client';
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
  @IsString()
  @IsUUID()
  readonly merchantId!: string;

  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  readonly amount!: string;

  @IsEnum(Currency)
  readonly currency!: Currency;

  @IsEnum(TransactionType)
  readonly type!: TransactionType;

  @IsString()
  readonly reference!: string;

  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, unknown>;
}

export class CreateTransactionOutput {
  @IsString()
  readonly id!: string;

  @IsUUID()
  readonly merchantId!: string;

  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  readonly amount!: string;

  @IsEnum(Currency)
  readonly currency!: Currency;

  @IsEnum(TransactionType)
  readonly type!: TransactionType;

  @IsEnum(TransactionStatus)
  readonly status!: TransactionStatus;

  @IsString()
  readonly reference!: string;

  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, unknown>;

  @IsDate()
  readonly createdAt!: Date;

  @IsDate()
  readonly updatedAt!: Date;
}
