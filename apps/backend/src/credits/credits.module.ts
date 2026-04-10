import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Credit, CreditSchema } from './schemas/credit.schema';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Credit.name, schema: CreditSchema }])],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
