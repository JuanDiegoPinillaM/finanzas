import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { DebtType } from '../schemas/debt.schema';

export class CreateDebtDto {
  @IsEnum(DebtType)
  type: DebtType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  period: string;
}

export class UpdateDebtDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
