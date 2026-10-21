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
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CustomerService } from './services/customer.service';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customers: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a customer' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customers.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List customers' })
  list() {
    return this.customers.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.customers.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.customers.remove(id);
  }
}
