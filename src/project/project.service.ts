import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { project, collaborator, role, user } from 'drizzle/schema';
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

  async findOne(id: number) {
    const [proj] = await this.db
    .select()
    .from(project)
    .where(eq(project.id, id))
    .limit(1);

    if (!proj) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    const imageObjects = (proj.images || []).map((url: string) => ({
      url,
      caption: null, // Placeholder for optional captions
    }));

    return {
      title: proj.title,
      dateLaunched: proj.dateLaunched,
      briefDesc: proj.briefDesc,
      fullDesc: proj.fullDesc,
      // COLLABORATORS
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

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
