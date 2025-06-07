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
  @ApiProperty({
    description: 'The project’s title.',
    example: 'My Awesome Project',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'A short summary or brief description of the project.',
    example: 'A quick summary of the project goals.',
  })
  briefDesc: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Detailed description explaining the project fully.',
    example: 'This project aims to develop a new platform for ...',
  })
  fullDesc: string;

  @IsDateString()
  @ApiProperty({
    description: 'Date the project was launched or started (ISO 8601 format).',
    example: '2023-04-01T00:00:00.000Z',
  })
  dateLaunched: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkDto)
  @IsOptional()
  @ApiProperty({
    type: [ProjectLinkDto],
    description: 'An array of related project links like website, repo.',
    example: [
      { name: 'GitHub', link: 'https://github.com/myproject' },
      { name: 'Website', link: 'https://myproject.com' },
    ],
    required: false,
  })
  links?: ProjectLinkDto[];

  @IsEnum(statusTagEnum.enumValues)
  @ApiProperty({
    description: 'The current status of the project.',
    example: statusTagEnum.enumValues[0],
    enum: statusTagEnum.enumValues,
  })
  status: (typeof statusTagEnum.enumValues)[number];

  @IsEnum(typeTagEnum.enumValues)
  @ApiProperty({
    description: 'The type or category of the project.',
    example: typeTagEnum.enumValues[0],
    enum: typeTagEnum.enumValues,
  })
  type: (typeof typeTagEnum.enumValues)[number];

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Whether the project is featured or highlighted.',
    example: true,
    required: false,
  })
  featured?: boolean;
}
export class MulterClassCreateProjectDto extends CreateProjectDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Multiple files upload images',
    required: false,
  })
  newImages?: Express.Multer.File[];
}
