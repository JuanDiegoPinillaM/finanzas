import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto/investment.dto';
import { InvestmentType } from './schemas/investment.schema';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly service: InvestmentsService) {}

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() dto: CreateInvestmentDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  find(@Request() req: { user: { userId: string } }, @Query('period') period: string, @Query('type') type?: InvestmentType) {
    return this.service.findByPeriod(req.user.userId, period, type);
  }

  @Get('summary')
  getSummary(@Request() req: { user: { userId: string } }, @Query('period') period: string) {
    return this.service.getSummary(req.user.userId, period);
  }

  @Patch(':id')
  update(@Request() req: { user: { userId: string } }, @Param('id') id: string, @Body() dto: UpdateInvestmentDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
