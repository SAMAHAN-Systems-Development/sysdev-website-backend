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
  projects, 
  roles 
} from 'drizzle/schema';
import { MinioService } from 'src/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { and, eq, isNull } from 'drizzle-orm';

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
    const bucketName = this.configService.get<string>('IMAGE_BUCKET');
    const uploadResults = await Promise.all(
      imageFiles.map((file) =>
        this.miniIoService.uploadObject(file, bucketName),
      ),
    );

    const imageUrls = uploadResults.map((res) => res.url);

    const {
      title,
      briefDesc,
      fullDesc,
      dateLaunched,
      links,
      status,
      type,
      featured = false,
    } = createProjectDto;

    const inserted = await this.db
      .insert(projects)
      .values({
        title,
        briefDesc,
        fullDesc,
        dateLaunched: new Date(dateLaunched),
        links: links ?? null,
        images: imageUrls,
        status,
        type,
        featured,
      })
      .returning();

    return inserted[0];
  }

  findAll() {
    return this.db.select().from(projects);
  }

  async findOne(id: number) {
  const [proj] = await this.db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!proj) {
    throw new NotFoundException(`Project with ID ${id} not found.`);
  }

  const projectCollaborators = await this.db
    .select()
    .from(collaborator)
    .where(eq(collaborator.projectId, id));

  const collaboratorsWithMembersByRole = await Promise.all(
    projectCollaborators.map(async (collab) => {
      const assignments = await this.db
        .select()
        .from(collaboratorAssignments)
        .where(eq(collaboratorAssignments.collaboratorId, collab.id));

      const membersByRole: Record<string, any[]> = {};

      for (const assign of assignments) {
        const [[member], [role]] = await Promise.all([
          this.db
            .select()
            .from(members)
            .where(eq(members.id, assign.memberId))
            .limit(1),

          this.db
            .select()
            .from(roles)
            .where(eq(roles.id, assign.roleId))
            .limit(1),
        ]);

        const roleName = role?.name ?? 'Unknown';

        if (!membersByRole[roleName]) {
          membersByRole[roleName] = [];
        }

        membersByRole[roleName].push(member);
      }

      return {
        collaborator: collab,
        membersByRole,
      };
    })
  );

  const imageObjects = (proj.images || []).map((url: string) => ({
    url,
    caption: null,
  }));

  return {
    title: proj.title,
    dateLaunched: proj.dateLaunched,
    briefDesc: proj.briefDesc,
    fullDesc: proj.fullDesc,
    collaborators: collaboratorsWithMembersByRole,
    images: imageObjects,
    links: proj.links,
    status: proj.status,
    type: proj.type,
    featured: proj.featured,
  };
}

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  async remove(id: number) {
    try {
      // Soft-delete the project if not already deleted
      const [updatedProject] = await this.db
        .update(projects)
        .set({ deletedAt: new Date() })
        .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
        .returning();

      // If nothing was deleted, query again to find out why
      if (!updatedProject) {
        const [existing] = await this.db
          .select()
          .from(projects)
          .where(eq(projects.id, id))
          .limit(1);

        if (!existing) {
          throw new NotFoundException(`Project with ID ${id} not found.`);
        } else {
          throw new BadRequestException(
            `Project with ID ${id} is already deleted.`,
          );
        }
      }

      return updatedProject;
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
