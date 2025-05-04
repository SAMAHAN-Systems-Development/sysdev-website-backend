import { Injectable } from '@nestjs/common';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

@Injectable()
export class ProjectMembersService {
  create(createProjectMemberDto: CreateProjectMemberDto) {
    return 'This action adds a new projectMember';
  }

  findAll() {
    return `This action returns all projectMembers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectMember`;
  }

  update(id: number, updateProjectMemberDto: UpdateProjectMemberDto) {
    return `This action updates a #${id} projectMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectMember`;
  }
}
