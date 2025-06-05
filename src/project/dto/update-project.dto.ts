import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsArray, IsString } from 'class-validator';

// TODO: Enhance validation for URL
export class UpdateProjectDto extends CreateProjectDto {
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
    },
    description: 'Array of existing image URLs or identifiers',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  existingImages: string[];
}
export class MulterClassUpdateProjectDto extends UpdateProjectDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Multiple files upload images',
    required: false,
  })
  images?: Express.Multer.File[];
}
