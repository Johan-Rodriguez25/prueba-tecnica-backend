import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  GenerateSettlementInput,
  GenerateSettlementOutput,
} from './generate-settlement.dto';
import { GenerateSettlementUseCase } from './generate-settlement.use-case';

@ApiTags('settlements')
@Controller({ path: 'settlements', version: '1' })
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
  ): Promise<GenerateSettlementOutput> {
    return this.generateSettlementUseCase.execute(body);
  }
}
