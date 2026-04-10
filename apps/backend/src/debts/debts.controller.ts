import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DebtsService } from './debts.service';
import { CreateDebtDto, UpdateDebtDto } from './dto/debt.dto';
import { DebtType } from './schemas/debt.schema';

@Controller('debts')
@UseGuards(JwtAuthGuard)
export class DebtsController {
  constructor(private readonly service: DebtsService) {}

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() dto: CreateDebtDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  find(@Request() req: { user: { userId: string } }, @Query('period') period: string, @Query('type') type?: DebtType) {
    return this.service.findByPeriod(req.user.userId, period, type);
  }

  @Get('summary')
  getSummary(@Request() req: { user: { userId: string } }, @Query('period') period: string) {
    return this.service.getSummary(req.user.userId, period);
  }

  @Patch(':id')
  update(@Request() req: { user: { userId: string } }, @Param('id') id: string, @Body() dto: UpdateDebtDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
