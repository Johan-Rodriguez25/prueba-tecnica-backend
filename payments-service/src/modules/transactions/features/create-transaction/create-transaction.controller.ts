import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateTransactionInput,
  CreateTransactionOutput,
} from './create-transaction.dto';
import { CreateTransactionUseCase } from './create-transaction.use-case';

@ApiTags('transactions')
@Controller({ path: 'transactions', version: '1' })
export class CreateTransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  @ApiBody({ type: CreateTransactionInput })
  @ApiCreatedResponse({ type: CreateTransactionOutput })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreateTransactionInput,
  ): Promise<CreateTransactionOutput> {
    return this.createTransactionUseCase.execute(body);
  }
}
