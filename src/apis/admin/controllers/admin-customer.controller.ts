import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateCustomerDto } from '../../../core/dtos/customer/create-customer.dto';
import { UpdateCustomerDto } from '../../../core/dtos/customer/update-customer.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { CustomerApplicationService } from '../../customer/services/customer-application.service';

@ApiTags('admin/customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/customers')
export class AdminCustomerController {
  constructor(private readonly customerApp: CustomerApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'List customers' })
  list() {
    return this.customerApp.listCustomers();
  }

  @Post()
  @ApiOperation({ summary: 'Create a customer' })
  create(@Body() body: CreateCustomerDto) {
    return this.customerApp.createCustomer(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.customerApp.getCustomer(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() body: UpdateCustomerDto) {
    return this.customerApp.updateCustomer(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.customerApp.deleteCustomer(id);
  }
}
