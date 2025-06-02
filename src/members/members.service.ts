import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import {
  DATABASE_CONNECTION,
  Database,
} from 'src/database/database-connection';
import { memberRoles, members, roles } from 'drizzle/schema';
import { eq, isNull, and, inArray } from 'drizzle-orm';
export type Member = typeof members.$inferSelect;
import { ConfigService } from '@nestjs/config';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class MembersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
    private readonly miniIoService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createMemberDto: CreateMemberDto,
    photo: Express.Multer.File | undefined,
  ) {
    return this.db.transaction(async (tx) => {
      try {
        const bucketName = this.configService.get<string>('IMAGE_BUCKET');
        let photoUrl: string | undefined = undefined;
        if (photo !== undefined) {
          const uploadResult = await this.miniIoService.uploadObject(
            photo,
            bucketName,
          );
          photoUrl = uploadResult.url;
        }
        const [newMember] = await tx
          .insert(members)
          .values({
            ...createMemberDto,
            photo: photoUrl,
            // NOTE: the database default for is_visible is actually false
            // but the API specifies it should be true
            // https://github.com/SAMAHAN-Systems-Development/sysdev-website-backend/issues/9
            isVisible: createMemberDto.isVisible ?? true,
          })
          .returning();
        // Assigning Roles
        await Promise.all(
          createMemberDto.roleIds.map((id) =>
            tx.insert(memberRoles).values({
              memberId: newMember.id,
              roleId: id,
            }),
          ),
        );
        // Getting Generated Roles
        const rolesWithDetails = await tx
          .select()
          .from(memberRoles)
          .leftJoin(roles, eq(roles.id, memberRoles.roleId))
          .where(
            and(
              isNull(memberRoles.deletedAt),
              eq(memberRoles.memberId, newMember.id),
            ),
          );
        const roleData = rolesWithDetails.map((r) => r.roles);
        // Assigning Roles
        const formattedData = {
          ...newMember,
          roles: roleData,
        };
        return formattedData;
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
    });
  }

  async findAll(roleId: number) {
    const condition = [eq(members.isVisible, true), isNull(members.deletedAt)];

    const result = await this.db
      .select()
      .from(members)
      .where(and(...condition))
      .orderBy(members.name);
    console.log(result);
    const rolesByMemberId = await this.getRolesByMemberId();

    const filteredResult = result
      .filter((row) => {
        // Applied Role filter
        const rolesData = rolesByMemberId.get(row.id) || [];

        if (roleId) {
          return rolesData.some(
            (p: unknown) => (p as { id: number }).id === roleId,
          );
        }

        return true;
      })
      .map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        photo: row.photo,
        roles: rolesByMemberId.get(row.id) || [],
      }));
    return filteredResult;
  }

  findOne(id: number) {
    return `This action returns a #${id} member`;
  }

  async update(
    id: number,
    updateMemberDto: UpdateMemberDto,
    photo: Express.Multer.File | undefined,
  ) {
    console.log(updateMemberDto.roleIds);
    return this.db.transaction(async (tx) => {
      try {
        let photoUrl: string | undefined = undefined;
        const oldMemberData = await tx
          .select({ photo: members.photo })
          .from(members)
          .where(eq(members.id, id));
        // Delete Photo
        const oldPhoto = oldMemberData[0]?.photo;
        if (photo && oldPhoto) {
          await this.miniIoService.deleteObjectFromUrl(oldPhoto);
        }
        if (photo !== undefined) {
          const bucketName = this.configService.get<string>('IMAGE_BUCKET');
          // Upload image
          const uploadResult = await this.miniIoService.uploadObject(
            photo,
            bucketName,
          );
          photoUrl = uploadResult.url;
        }
        // Updating member Data
        const [updatedMember] = await this.db
          .update(members)
          .set({
            ...updateMemberDto,
            photo: photoUrl,
          })
          .where(eq(members.id, id))
          .returning();
        // UpdateRoles: Compare new record and old record
        // Old record -- DB
        const oldMemberRoles = await tx
          .select()
          .from(memberRoles)
          .where(
            and(eq(memberRoles.memberId, id), isNull(memberRoles.deletedAt)),
          );
        // Updated record
        const oldRoleIds = new Set(oldMemberRoles.map((r) => r.roleId));
        const newRoleIds = new Set(updateMemberDto.roleIds);
        // Case 1: If there is new id in the old record
        const roleIdsToDelete = [...oldRoleIds].filter(
          (id) => !newRoleIds.has(id),
        );

        // Case 2: If there is missing id in the old record
        const roleIdsToAdd = [...newRoleIds].filter(
          (id) => !oldRoleIds.has(id),
        );

        if (roleIdsToDelete.length > 0) {
          await tx
            .delete(memberRoles)
            .where(
              and(
                eq(memberRoles.memberId, id),
                inArray(memberRoles.roleId, roleIdsToDelete),
              ),
            );
        }
        if (roleIdsToAdd.length > 0) {
          await tx.insert(memberRoles).values(
            roleIdsToAdd.map((roleId) => ({
              memberId: id,
              roleId,
            })),
          );
        }
        const rolesWithDetails = await tx
          .select()
          .from(memberRoles)
          .leftJoin(roles, eq(roles.id, memberRoles.roleId))
          .where(
            and(isNull(memberRoles.deletedAt), eq(memberRoles.memberId, id)),
          );
        const roleData = rolesWithDetails.map((r) => r.roles);
        // Assigning Roles
        const formattedData = {
          ...updatedMember,
          roles: roleData,
        };
        return formattedData;
      } catch (error) {
        console.error('Update Member Error:', error.message, error.stack);
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Failed to update member');
      }
    });
  }

  async remove(id: number) {
    try {
      //change visibility of deleted member
      await this.db
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

  private async getRolesByMemberId(
    member_id: number | undefined = undefined,
  ): Promise<Map<number, unknown[]>> {
    const conditions = [isNull(memberRoles.deletedAt)];

    if (member_id !== undefined) {
      conditions.push(eq(memberRoles.memberId, member_id));
    }

    const result = await this.db
      .select()
      .from(memberRoles)
      .leftJoin(roles, eq(roles.id, memberRoles.roleId))
      .where(and(...conditions));

    const rolesByMemberId = new Map<number, unknown[]>();

    result.forEach(({ roles, member_roles }) => {
      const memberId = member_roles.memberId;
      if (memberId !== null) {
        if (!rolesByMemberId.has(memberId)) {
          rolesByMemberId.set(memberId, []);
        }
        rolesByMemberId.get(memberId)!.push({ roles });
      }
    });

    return rolesByMemberId;
  }
}
