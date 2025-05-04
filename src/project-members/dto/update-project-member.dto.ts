import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectMemberDto } from './create-project-member.dto';

export class UpdateProjectMemberDto extends PartialType(CreateProjectMemberDto) {}
