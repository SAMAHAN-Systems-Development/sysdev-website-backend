import { Inject, Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  DATABASE_CONNECTION,
  Database,
} from 'src/database/database-connection';
import { members } from 'drizzle/schema';
import { eq } from 'drizzle-orm';
export type Member = typeof members.$inferSelect;

@Injectable()
export class MembersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}
  create(createMemberDto: CreateMemberDto) {
    return 'This action adds a new member';
  }

  findAll() {
    return `This action returns all members`;
  }

  findOne(id: number) {
    return `This action returns a #${id} member`;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const [updatedMember] = await this.db
      .update(members)
      .set({
        ...updateMemberDto
      })
      .where(eq(members.id, id))
      .returning();

    return updatedMember;
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}
