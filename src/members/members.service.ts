import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  DATABASE_CONNECTION,
  Database,
} from 'src/database/database-connection';
import { members } from 'drizzle/schema';

@Injectable()
export class MembersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    try {
      const [newMember] = await this.db
        .insert(members)
        .values({
          ...createMemberDto,
          // NOTE: the database default for is_visible is actually false
          // but the API specifies it should be true
          // https://github.com/SAMAHAN-Systems-Development/sysdev-website-backend/issues/9
          isVisible: createMemberDto.isVisible ?? true,
        })
        .returning();

      return newMember;
    } catch (error) {
      console.error(error.code);
      if (error.code === '23503') {
        // PostgreSQL Foreign Key Error code 23503
        // catches when roleId does not refer to an existing role in the DB
        throw new BadRequestException('Role ID does not exist');
      }
      if (error instanceof BadRequestException) {
        // Re-throw validation errors as is
        throw error;
      }
      console.error('Failed to create member:', error);
      throw new InternalServerErrorException('Failed to create member');
    }
  }

  findAll() {
    return `This action returns all members`;
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
