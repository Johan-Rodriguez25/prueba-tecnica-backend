import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetNotificationsQuery,
  GetNotificationsOutput,
} from './get-notifications.dto';
import { GetNotificationsUseCase } from './get-notifications.use-case';

@ApiTags('notifications')
@ApiSecurity('api-key')
@Controller({ path: 'notifications', version: '1' })
export class GetNotificationsController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List notifications by merchant (paginated)' })
  @ApiQuery({
    name: 'merchantId',
    required: true,
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    schema: { type: 'integer', minimum: 1, default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiOkResponse({ type: GetNotificationsOutput })
  async get(
    @Query() query: GetNotificationsQuery,
  ): Promise<GetNotificationsOutput> {
    return this.getNotificationsUseCase.execute(query);
  }
}
