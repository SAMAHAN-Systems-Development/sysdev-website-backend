import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
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
export type Member = typeof members.$inferSelect;
import { NotFoundException } from '@nestjs/common';

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

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const [updatedMember] = await this.db
      .update(members)
      .set({
        ...updateMemberDto
      })
      .where(eq(members.id, id))
      .returning();

    if (!updatedMember) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return updatedMember;
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