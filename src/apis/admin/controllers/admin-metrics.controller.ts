import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { WorkOrderApplicationService } from '../../work-order/services/work-order-application.service';

@ApiTags('admin/metrics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/metrics')
export class AdminMetricsController {
  constructor(private readonly workOrderApp: WorkOrderApplicationService) {}

  @Get('average-execution-time')
  @ApiOperation({ summary: 'Get average execution time' })
  averageExecutionTime() {
    return this.workOrderApp.averageExecutionTime();
  }
}
