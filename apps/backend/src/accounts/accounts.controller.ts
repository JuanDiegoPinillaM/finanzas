import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() dto: CreateAccountDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  findByPeriod(@Request() req: { user: { userId: string } }, @Query('period') period: string) {
    return this.service.findByPeriod(req.user.userId, period);
  }

  @Get('summary')
  getSummary(@Request() req: { user: { userId: string } }, @Query('period') period: string) {
    return this.service.getSummary(req.user.userId, period);
  }

  @Post('generate-recurring')
  generateRecurring(@Request() req: { user: { userId: string } }, @Body('period') period: string) {
    return this.service.generateRecurring(req.user.userId, period);
  }

  @Patch(':id')
  update(@Request() req: { user: { userId: string } }, @Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
