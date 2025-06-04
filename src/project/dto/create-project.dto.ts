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
import { ProjectLinkDto } from './project-link.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  briefDesc: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  fullDesc: string;

  @IsDateString()
  @ApiProperty({ type: String })
  dateLaunched: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkDto)
  @IsOptional()
  @ApiProperty({ type: ProjectLinkDto })
  links?: ProjectLinkDto[];

  @IsEnum(statusTagEnum.enumValues)
  @ApiProperty({ type: statusTagEnum.enumValues })
  status: (typeof statusTagEnum.enumValues)[number];

  @IsEnum(typeTagEnum.enumValues)
  @ApiProperty({ type: typeTagEnum.enumValues })
  type: (typeof typeTagEnum.enumValues)[number];

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ type: Boolean })
  featured?: boolean;
}
export class MulterClassDto extends CreateProjectDto {
  // @ApiProperty({
  //   type: 'array',
  //   items: {
  //     type: 'string',
  //     format: 'binary',
  //   },
  //   description: 'Project images',
  //   required: false,
  // })
  // images?: Express.Multer.File[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Single file upload',
  })
  files?: Express.Multer.File[];
}
