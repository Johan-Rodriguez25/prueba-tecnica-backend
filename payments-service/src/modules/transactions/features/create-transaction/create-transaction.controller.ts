import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  CreateTransactionInput,
  CreateTransactionOutput,
} from './create-transaction.dto';
import { CreateTransactionUseCase } from './create-transaction.use-case';

@Controller('transactions')
export class CreateTransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreateTransactionInput,
  ): Promise<CreateTransactionOutput> {
    return this.createTransactionUseCase.execute(body);
  }
}
