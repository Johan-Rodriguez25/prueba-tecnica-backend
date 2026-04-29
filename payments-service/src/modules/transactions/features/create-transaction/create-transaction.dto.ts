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
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'amountGreaterThanZero', async: false })
class AmountGreaterThanZeroConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return false;
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) && numeric > 0;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be greater than 0`;
  }
}

export class CreateTransactionInput {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsUUID()
  readonly merchantId!: string;

  @ApiProperty({ example: '125.50' })
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/)
  @Validate(AmountGreaterThanZeroConstraint)
  readonly amount!: string;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  readonly currency!: Currency;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  readonly type!: TransactionType;

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
