import { OmitType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProjectLinkDto } from './project-link.dto';
import { plainToInstance, Transform, Type } from 'class-transformer';

// TODO: Enhance validation for URL
export class UpdateProjectDto extends OmitType(CreateProjectDto, ['links']) {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkDto)
  @Transform(({ value }) =>
    plainToInstance(
      ProjectLinkDto,
      value.map((link: string) => JSON.parse(link)),
    ),
  )
  links: ProjectLinkDto[];

  @IsBoolean()
  featured: boolean;
}
