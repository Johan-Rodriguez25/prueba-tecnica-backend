import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiKeyAuthGuard,
  type AuthenticatedMerchant,
} from '@/auth/api-key-auth.guard';
import { CurrentMerchant } from '@/auth/current-merchant.decorator';
import {
  GenerateSettlementInput,
  GenerateSettlementOutput,
} from './generate-settlement.dto';
import { GenerateSettlementUseCase } from './generate-settlement.use-case';

@ApiTags('settlements')
@ApiSecurity('api-key')
@Controller({ path: 'settlements', version: '1' })
@UseGuards(ApiKeyAuthGuard)
export class GenerateSettlementController {
  constructor(
    private readonly generateSettlementUseCase: GenerateSettlementUseCase,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate settlement' })
  @ApiBody({ type: GenerateSettlementInput })
  @ApiCreatedResponse({ type: GenerateSettlementOutput })
  async generate(
    @Body() body: GenerateSettlementInput,
    @CurrentMerchant() merchant: AuthenticatedMerchant,
  ): Promise<GenerateSettlementOutput> {
    if (body.merchant_id !== merchant.id) {
      throw new ForbiddenException(
        'merchant_id does not match api key merchant',
      );
    }
    return this.generateSettlementUseCase.execute(body);
  }
}
