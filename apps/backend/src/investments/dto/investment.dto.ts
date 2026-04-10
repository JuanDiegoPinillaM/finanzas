import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { InvestmentType } from '../schemas/investment.schema';

export class CreateInvestmentDto {
  @IsEnum(InvestmentType)
  type: InvestmentType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @IsOptional()
  monthlyReturn?: number;

  @IsNumber()
  @IsOptional()
  annualReturn?: number;

  @IsNumber()
  @IsOptional()
  valueCOP?: number;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  period: string;
}

export class UpdateInvestmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  value?: number;

  @IsNumber()
  @IsOptional()
  monthlyReturn?: number;

  @IsNumber()
  @IsOptional()
  annualReturn?: number;

  @IsNumber()
  @IsOptional()
  valueCOP?: number;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;
}
