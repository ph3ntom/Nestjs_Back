import { IsString, IsArray, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}