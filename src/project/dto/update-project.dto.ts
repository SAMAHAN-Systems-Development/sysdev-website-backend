import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @ValidateIf((_, value) => Array.isArray(value))
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images?: string[];
}
