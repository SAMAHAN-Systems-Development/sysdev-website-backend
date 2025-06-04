import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsEmailExists } from '../decorators/IsEmailExists.decorator';

export class CreateMemberDto {
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  roleIds: number[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmailExists()
  email: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isVisible?: boolean;
}
