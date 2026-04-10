import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  period: string;
}

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}
