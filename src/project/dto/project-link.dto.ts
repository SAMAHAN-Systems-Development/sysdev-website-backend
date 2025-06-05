import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ProjectLinkDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the link (e.g., GitHub, Website).',
    example: 'GitHub',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'URL or hyperlink for the link.',
    example: 'https://github.com/myproject',
  })
  link: string;
}
