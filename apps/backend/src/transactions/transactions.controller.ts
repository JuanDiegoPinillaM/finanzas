import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from './schemas/transaction.schema';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(req.user.userId, dto);
  }

  @Get()
  findByPeriod(
    @Request() req: { user: { userId: string } },
    @Query('period') period: string,
    @Query('type') type?: TransactionType,
  ) {
    return this.transactionsService.findByPeriod(req.user.userId, period, type);
  }

  @Get('summary')
  getSummary(
    @Request() req: { user: { userId: string } },
    @Query('period') period: string,
  ) {
    return this.transactionsService.getSummary(req.user.userId, period);
  }

  @Post('generate-recurring')
  generateRecurring(
    @Request() req: { user: { userId: string } },
    @Body('period') period: string,
  ) {
    return this.transactionsService.generateRecurring(req.user.userId, period);
  }

  @Patch(':id')
  update(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(req.user.userId, id, dto);
  }

  @Patch(':id/toggle-paid')
  togglePaid(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.transactionsService.togglePaid(req.user.userId, id);
  }

  @Delete(':id')
  remove(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    return this.transactionsService.remove(req.user.userId, id);
  }
}
