import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetNotificationParams,
  GetNotificationOutput,
} from './get-notification.dto';
import { GetNotificationUseCase } from './get-notification.use-case';

@ApiTags('notifications')
@ApiSecurity('api-key')
@Controller({ path: 'notifications', version: '1' })
export class GetNotificationController {
  constructor(
    private readonly getNotificationUseCase: GetNotificationUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get notification detail by id' })
  @ApiParam({
    name: 'id',
    required: true,
    schema: { type: 'string', format: 'uuid' },
  })
  @ApiOkResponse({ type: GetNotificationOutput })
  async get(
    @Param() params: GetNotificationParams,
  ): Promise<GetNotificationOutput> {
    return this.getNotificationUseCase.execute(params);
  }
}
