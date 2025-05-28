import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { statusTagEnum, typeTagEnum } from 'drizzle/schema';

class ProjectLinkDto {
  @IsString()
  name: string;

  @IsString()
  link: string;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  briefDesc: string;

  @IsString()
  @IsNotEmpty()
  fullDesc: string;

  @IsDateString()
  dateLaunched: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkDto)
  @IsOptional()
  links?: ProjectLinkDto[];

  @IsEnum(statusTagEnum.enumValues)
  status: (typeof statusTagEnum.enumValues)[number];

  @IsEnum(typeTagEnum.enumValues)
  type: (typeof typeTagEnum.enumValues)[number];

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}
