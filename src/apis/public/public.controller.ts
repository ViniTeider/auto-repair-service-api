import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { DomainError } from '../../core/domain/domain-error';
import { WorkOrderService } from '../work-order/work-order.service';
import {
  BudgetDecision,
  budgetPage,
  budgetErrorPage,
  budgetResultPage,
} from '../../core/templates/budget-page.template';

@ApiTags('public/work-order')
@Controller('public/work-order')
export class PublicController {
  constructor(private readonly orders: WorkOrderService) {}

  @Get(':code')
  @ApiOperation({ summary: 'Track a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: {
      status: HttpStatus.OK,
      description: 'Current work order progress',
    },
    notFound: 'Work order not found',
  })
  progress(@Param('code') code: string) {
    return this.orders.getProgress(code);
  }

  @Get(':code/budget')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @ApiOperation({
    summary:
      'Budget page with the work order details and the approve and deny buttons (link sent by email)',
  })
  @ApiParam({ name: 'code' })
  @ApiProduces('text/html')
  @ApiResponses({
    success: {
      status: HttpStatus.OK,
      description: 'HTML page with the budget and the approve and deny buttons',
    },
    notFound: 'Work order not found',
  })
  async budget(@Param('code') code: string) {
    return budgetPage(await this.orders.getBudget(code));
  }

  @Post(':code/approve')
  @ApiOperation({ summary: 'Approve the budget of a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'Budget approved and execution started',
    },
    badRequest:
      'Insufficient stock: the remaining stock would fall below the minimum stock',
    notFound: 'Work order not found',
    unprocessable: 'Work order is not awaiting approval',
  })
  approve(
    @Param('code') code: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.decide(code, 'approve', request, response);
  }

  @Post(':code/deny')
  @ApiOperation({ summary: 'Deny the budget of a work order' })
  @ApiParam({ name: 'code' })
  @ApiResponses({
    success: {
      status: HttpStatus.CREATED,
      description: 'Budget denied and work order returned to diagnosis',
    },
    notFound: 'Work order not found',
    unprocessable: 'Work order is not awaiting approval',
  })
  deny(
    @Param('code') code: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.decide(code, 'deny', request, response);
  }

  // The confirmation page posts a browser form, so browsers get an HTML answer and API clients get JSON.
  private async decide(
    code: string,
    decision: BudgetDecision,
    request: Request,
    response: Response,
  ) {
    const wantsHtml = request.accepts(['json', 'html']) === 'html';
    try {
      const progress =
        decision === 'approve'
          ? await this.orders.approve(code)
          : await this.orders.deny(code);
      if (!wantsHtml) return progress;
      response.type('html');
      return budgetResultPage(code, decision);
    } catch (error) {
      if (!wantsHtml) throw error;
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : error instanceof DomainError
            ? HttpStatus.UNPROCESSABLE_ENTITY
            : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof HttpException || error instanceof DomainError
          ? error.message
          : 'Unexpected error';
      response.status(status).type('html');
      return budgetErrorPage(message);
    }
  }
}
