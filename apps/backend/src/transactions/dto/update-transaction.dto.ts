import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  source?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  paidDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
