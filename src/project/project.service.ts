import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import {
  collaborator,
  collaboratorAssignments,
  members,
  organizations,
  projects,
  roles,
  statusTagEnum,
  typeTagEnum,
} from 'drizzle/schema';
import { MinioService } from 'src/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { desc, asc, and, eq, inArray, isNull } from 'drizzle-orm';
import { Project } from './entities/project.entity';
import { retry } from 'src/utils/retry';

type StatusTag = (typeof statusTagEnum.enumValues)[number];
type TypeTag = (typeof typeTagEnum.enumValues)[number];

@Injectable()
export class ProjectService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
    private readonly miniIoService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    imageFiles: Express.Multer.File[],
  ) {
    return this.db.transaction(async (tx) => {
      const bucketName = this.configService.get<string>('IMAGE_BUCKET');
      const uploadResults = await Promise.all(
        imageFiles.map((file) =>
          this.miniIoService.uploadObject(file, bucketName),
        ),
      );

      const imageUrls = uploadResults.map((res) => res.url);

      const inserted = await tx
        .insert(projects)
        .values({
          ...createProjectDto,
          dateLaunched: new Date(createProjectDto.dateLaunched),
          images: imageUrls,
        })
        .returning();

      return inserted[0];
    });
  }

  async findAll(
    sortBy: 'yearAsc' | 'yearDesc',
    status?: StatusTag,
    type?: TypeTag,
    showFeaturedOnly?: boolean,
    page?: number,
    limit?: number,
  ) {
    const skip = (page - 1) * limit;

    const query = await this.db
      .select()
      .from(projects)
      .where(
        and(
          status ? eq(projects.status, status) : undefined,
          type ? eq(projects.type, type) : undefined,
          showFeaturedOnly ? eq(projects.featured, true) : undefined,
        ),
      )
      .orderBy(
        desc(projects.featured),
        sortBy === 'yearDesc'
          ? desc(projects.dateLaunched)
          : asc(projects.dateLaunched),
        asc(projects.id), //to ensure consistent pagination
      )
      .limit(limit)
      .offset(skip);

    return query;
  }

  async findOne(id: number) {
    const [proj] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    const collaborators = await this.db
      .select()
      .from(collaborator)
      .where(eq(collaborator.projectId, id));

    const collaboratorIds = collaborators.map((c) => c.id);

    const assignments = await this.db
      .select()
      .from(collaboratorAssignments)
      .where(inArray(collaboratorAssignments.collaboratorId, collaboratorIds));

    const roleIds = assignments.map((a) => a.roleId);
    const memberIds = assignments
      .filter((a) => a.memberId)
      .map((a) => a.memberId);
    const organizationIds = assignments
      .filter((a) => a.organizationId)
      .map((a) => a.organizationId);

    const [rolesList, membersList, orgsList] = await Promise.all([
      this.db.select().from(roles).where(inArray(roles.id, roleIds)),
      this.db.select().from(members).where(inArray(members.id, memberIds)),
      this.db
        .select()
        .from(organizations)
        .where(inArray(organizations.id, organizationIds)),
    ]);

    const roleMap = Object.fromEntries(rolesList.map((r) => [r.id, r.name]));
    const memberMap = Object.fromEntries(membersList.map((m) => [m.id, m]));
    const orgMap = Object.fromEntries(orgsList.map((o) => [o.id, o]));

    const collaboratorsByRole: Record<
      string,
      { members: any[]; organizations: any[] }
    > = {};

    for (const assign of assignments) {
      const roleName = roleMap[assign.roleId] ?? 'Unknown';
      if (!collaboratorsByRole[roleName]) {
        collaboratorsByRole[roleName] = { members: [], organizations: [] };
      }

      if (assign.memberId) {
        collaboratorsByRole[roleName].members.push(memberMap[assign.memberId]);
      } else if (assign.organizationId) {
        collaboratorsByRole[roleName].organizations.push(
          orgMap[assign.organizationId],
        );
      }
    }

    return {
      title: proj.title,
      dateLaunched: proj.dateLaunched,
      briefDesc: proj.briefDesc,
      fullDesc: proj.fullDesc,
      collaboratorsByRole,
      images: (proj.images || []).map((url: string) => ({
        url,
        caption: null,
      })),
      links: proj.links,
      status: proj.status,
      type: proj.type,
      featured: proj.featured,
    };
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    images?: Express.Multer.File[],
  ) {
    return this.db.transaction(async (tx) => {
      let result: Project;
      const project = await tx
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!project[0]) throw new NotFoundException('Project not found');

      const existingImageUrls = project[0].images ?? [];
      const invalidImages = updateProjectDto.images.filter(
        (image) => !existingImageUrls[0].includes(image),
      );

      if (invalidImages.length > 0) {
        throw new BadRequestException(
          'Payload images list contains unknown links',
        );
      }

      result = (
        await tx
          .update(projects)
          .set({
            ...updateProjectDto,
            images: updateProjectDto.images,
            dateLaunched: new Date(updateProjectDto.dateLaunched),
          })
          .where(eq(projects.id, id))
          .returning()
          .execute()
      )[0];

      if (images) {
        const uploadResults = images.length
          ? await Promise.allSettled(
              images.map((file) =>
                retry(
                  () =>
                    this.miniIoService.uploadObject(
                      file,
                      this.configService.get<string>('IMAGE_BUCKET'),
                    ),
                  'Upload Image',
                  3,
                  500,
                ),
              ),
            )
          : [];

        const successfulUploads = uploadResults
          .filter(
            (
              res,
            ): res is PromiseFulfilledResult<{ key: string; url: string }> =>
              res.status === 'fulfilled',
          )
          .map((res) => res.value.url);

        const failedUploads = uploadResults
          .filter(
            (res): res is PromiseRejectedResult => res.status === 'rejected',
          )
          .map((res) => res.reason);

        const deletedImages = existingImageUrls.filter(
          (url) => !updateProjectDto.images.includes(url),
        );

        await Promise.all(
          deletedImages.map((url) =>
            retry(
              () => this.miniIoService.deleteObjectFromUrl(url),
              'Delete Images',
            ),
          ),
        );

        if (successfulUploads.length > 0) {
          result = (
            await tx
              .update(projects)
              .set({
                images: updateProjectDto.images.concat(successfulUploads),
              })
              .where(eq(projects.id, id))
              .returning()
              .execute()
          )[0];
        }
        return { result, failedUploads: failedUploads };
      }
      return { result, failedUploads: [] };
    });
  }

  async remove(id: number) {
    try {
      // Soft-delete the project if not already deleted
      await this.db
        .update(projects)
        .set({ deletedAt: new Date() })
        .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
        .returning();

      return {
        statusCode: 200,
        message: `Successfully deleted project with ID ${id}`,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        // Re-throw validation and not found errors as is
        throw error;
      }
      console.error(`Failed to delete project ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Failed to delete project ID ${id}.`,
      );
    }
  }
}
