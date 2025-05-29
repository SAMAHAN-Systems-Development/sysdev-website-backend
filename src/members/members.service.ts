import { Inject, Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  DATABASE_CONNECTION,
  Database,
} from 'src/database/database-connection';
import { eq, and } from 'drizzle-orm';
import { members, roles} from 'drizzle/schema'; 

@Injectable()
export class MembersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}
  create(createMemberDto: CreateMemberDto) {
    return 'This action adds a new member';
  }

  async findAll(roleName?: string) {
    let condition = eq(members.isVisible, true);
  
    if (roleName) {
      condition = and(condition, eq(roles.name, roleName));
    }
  
    const query = await this.db
      .select({
        name: members.name,
        email: members.email,
        role: roles.name,
        photo: members.photo,
      })
      .from(members)
      .leftJoin(roles, eq(members.roleId, roles.id))
      .where(condition)
      .orderBy(members.name);
  
    return query;
  }
          
  findOne(id: number) {
    return `This action returns a #${id} member`;
  }

  update(id: number, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}