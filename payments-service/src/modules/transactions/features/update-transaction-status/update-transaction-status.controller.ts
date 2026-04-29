import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiKeyAuthGuard,
  type AuthenticatedMerchant,
} from '@/auth/api-key-auth.guard';
import { CurrentMerchant } from '@/auth/current-merchant.decorator';
import {
  UpdateTransactionStatusBody,
  UpdateTransactionStatusOutput,
  UpdateTransactionStatusParams,
} from './update-transaction-status.dto';
import { UpdateTransactionStatusUseCase } from './update-transaction-status.use-case';

@ApiTags('transactions')
@ApiSecurity('api-key')
@Controller({ path: 'transactions', version: '1' })
@UseGuards(ApiKeyAuthGuard)
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
    @CurrentMerchant() merchant: AuthenticatedMerchant,
  ): Promise<UpdateTransactionStatusOutput> {
    return this.updateTransactionStatusUseCase.execute(
      params,
      body,
      merchant.id,
    );
  }
}
