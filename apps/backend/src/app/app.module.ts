import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { AccountsModule } from '../accounts/accounts.module';
import { DebtsModule } from '../debts/debts.module';
import { InvestmentsModule } from '../investments/investments.module';
import { CreditsModule } from '../credits/credits.module';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    UsersModule,
    TransactionsModule,
    AccountsModule,
    DebtsModule,
    InvestmentsModule,
    CreditsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
