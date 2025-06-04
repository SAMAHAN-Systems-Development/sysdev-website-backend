import { CreateProjectDto } from './create-project.dto';
import { IsArray, IsString } from 'class-validator';

// TODO: Enhance validation for URL
export class UpdateProjectDto extends CreateProjectDto {
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
