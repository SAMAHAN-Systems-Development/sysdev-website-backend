import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { project } from 'drizzle/schema';
import { eq } from 'drizzle-orm';

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
    return this.db.select().from(project);
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<void> {
    try {
      await this.db
        .update(project)
        .set(updateProjectDto)
        .where(eq(project.id, id))
        .returning();
    } catch (error) {
      throw new InternalServerErrorException('Failed to update project', {
        cause: error,
        description: error.message || undefined,
      });
    }
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
