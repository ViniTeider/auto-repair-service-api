import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CustomerService } from '../service/customer.service';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customers: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'List persisted customers' })
  list() {
    return this.customers.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a persisted customer' })
  @ApiParam({ name: 'id', format: 'uuid' })
  getById(@Param('id') id: string) {
    return this.customers.getById(id);
  }
}
