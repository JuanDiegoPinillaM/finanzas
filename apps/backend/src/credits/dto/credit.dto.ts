import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateCreditDto {
  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  period: string;
}

export class UpdateCreditDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  type?: string;
}
