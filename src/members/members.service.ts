import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  DATABASE_CONNECTION,
  Database,
} from 'src/database/database-connection';
import { members } from 'drizzle/schema';
import { eq } from 'drizzle-orm';

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

  update(id: number, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  async remove(id: number) {
    try {
      //find member
      const member = await this.db
        .select()
        .from(members)
        .where(eq(members.id, id));

      //check if member exists
      const foundMember = member[0];
      if (!foundMember) {
        throw new HttpException(
          `Member with ID ${id} not found.`,
          HttpStatus.NOT_FOUND,
        );
      }

      //check if member is already deleted
      if (foundMember.deletedAt) {
        throw new HttpException(
          `Member with ID ${id} is already deleted`,
          HttpStatus.BAD_REQUEST,
        );
      }

      //change visibility of deleted member
      const softDeletedMember = await this.db
        .update(members)
        .set({
          isVisible: false,
          deletedAt: new Date(),
        })
        .where(eq(members.id, id))
        .returning();

      return {
        message: `Successfuly deleted member with ID ${id}`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      }

      throw new HttpException(
        `Failed to delete member`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
