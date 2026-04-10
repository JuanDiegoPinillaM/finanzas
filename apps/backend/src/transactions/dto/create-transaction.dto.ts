import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { TransactionType } from '../schemas/transaction.schema';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsDateString()
  dueDate: string;

  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM format' })
  period: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
