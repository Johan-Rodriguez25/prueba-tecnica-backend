import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  UpdateTransactionStatusBody,
  UpdateTransactionStatusOutput,
  UpdateTransactionStatusParams,
} from './update-transaction-status.dto';
import { UpdateTransactionStatusUseCase } from './update-transaction-status.use-case';

@ApiTags('transactions')
@Controller({ path: 'transactions', version: '1' })
export class UpdateTransactionStatusController {
  constructor(
    private readonly updateTransactionStatusUseCase: UpdateTransactionStatusUseCase,
  ) {}

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update transaction status' })
  @ApiParam({
    name: 'id',
    required: true,
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiBody({ type: UpdateTransactionStatusBody })
  @ApiOkResponse({ type: UpdateTransactionStatusOutput })
  async updateStatus(
    @Param() params: UpdateTransactionStatusParams,
    @Body() body: UpdateTransactionStatusBody,
  ): Promise<UpdateTransactionStatusOutput> {
    return this.updateTransactionStatusUseCase.execute(params, body);
  }
}

