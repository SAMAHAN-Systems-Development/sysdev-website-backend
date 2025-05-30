import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateMemberDto {
  @IsInt()
  roleId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  photo?: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
