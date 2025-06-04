import { IsString } from 'class-validator';

export class ProjectLinkDto {
  @IsString()
  name: string;

  @IsString()
  link: string;
}
