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
import { projects } from 'drizzle/schema';
import { and, eq, isNull } from 'drizzle-orm';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}
  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  findAll() {
    return this.db.select().from(projects);
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
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
