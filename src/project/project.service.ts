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
  roles 
} from 'drizzle/schema';
import { MinioService } from 'src/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, isNull } from 'drizzle-orm';

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

    const collaborators = await this.db
      .select()
      .from(collaborator)
      .where(eq(collaborator.projectId, id));

    const collaboratorIds = collaborators.map(c => c.id);

    const assignments = await this.db
      .select()
      .from(collaboratorAssignments)
      .where(inArray(collaboratorAssignments.collaboratorId, collaboratorIds));

    const roleIds = assignments.map(a => a.roleId);
    const memberIds = assignments.filter(a => a.memberId).map(a => a.memberId);
    const organizationIds = assignments.filter(a => a.organizationId).map(a => a.organizationId);

    const [rolesList, membersList, orgsList] = await Promise.all([
      this.db.select().from(roles).where(inArray(roles.id, roleIds)),
      this.db.select().from(members).where(inArray(members.id, memberIds)),
      this.db.select().from(organizations).where(inArray(organizations.id, organizationIds)),
    ]);

    const roleMap = Object.fromEntries(rolesList.map(r => [r.id, r.name]));
    const memberMap = Object.fromEntries(membersList.map(m => [m.id, m]));
    const orgMap = Object.fromEntries(orgsList.map(o => [o.id, o]));

    const collaboratorsByRole: Record<string, { members: any[], organizations: any[] }> = {};

    for (const assign of assignments) {
      const roleName = roleMap[assign.roleId] ?? 'Unknown';
      if (!collaboratorsByRole[roleName]) {
        collaboratorsByRole[roleName] = { members: [], organizations: [] };
      }

      if (assign.memberId) {
        collaboratorsByRole[roleName].members.push(memberMap[assign.memberId]);
      } else if (assign.organizationId) {
        collaboratorsByRole[roleName].organizations.push(orgMap[assign.organizationId]);
      }
    }

    return {
      title: proj.title,
      dateLaunched: proj.dateLaunched,
      briefDesc: proj.briefDesc,
      fullDesc: proj.fullDesc,
      collaboratorsByRole,
      images: (proj.images || []).map((url: string) => ({ url, caption: null })),
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
