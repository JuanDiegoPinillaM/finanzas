import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreditsService } from './credits.service';
import { CreateCreditDto, UpdateCreditDto } from './dto/credit.dto';

@Controller('credits')
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private readonly service: CreditsService) {}

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() dto: CreateCreditDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  find(@Request() req: { user: { userId: string } }, @Query('period') period: string) {
    return this.service.findByPeriod(req.user.userId, period);
  }

  @Get('summary')
  getSummary(@Request() req: { user: { userId: string } }, @Query('period') period: string) {
    return this.service.getSummary(req.user.userId, period);
  }

  @Patch(':id')
  update(@Request() req: { user: { userId: string } }, @Param('id') id: string, @Body() dto: UpdateCreditDto) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
