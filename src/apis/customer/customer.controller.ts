import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCustomerDto } from '../../core/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../core/dtos/customer/update-customer.dto';
import { ApiResponses } from '../../core/decorators/api-responses.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CustomerService } from './customer.service';

@ApiTags('customer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customers: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a customer' })
  @ApiResponses({
    success: { status: HttpStatus.CREATED, description: 'Customer created' },
    badRequest: true,
    unauthorized: true,
    conflict: 'Customer document already exists',
    unprocessable: 'Invalid customer document',
  })
  create(@Body() dto: CreateCustomerDto) {
    return this.customers.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List customers' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'List of customers' },
    unauthorized: true,
  })
  list() {
    return this.customers.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Customer found' },
    badRequest: 'Invalid id format',
    unauthorized: true,
    notFound: 'Customer not found',
  })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.customers.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.OK, description: 'Customer updated' },
    badRequest: true,
    unauthorized: true,
    notFound: 'Customer not found',
    conflict: 'Customer document already exists',
    unprocessable: 'Invalid customer document',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customers.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponses({
    success: { status: HttpStatus.NO_CONTENT, description: 'Customer deleted' },
    badRequest: 'Invalid id format',
    unauthorized: true,
    notFound: 'Customer not found',
    conflict: 'Customer is referenced by work orders',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customers.remove(id);
  }
}
