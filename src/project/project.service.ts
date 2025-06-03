import { Inject, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { projects, statusTagEnum, typeTagEnum } from 'drizzle/schema';
import { desc, asc, eq, and } from 'drizzle-orm';

type StatusTag = typeof statusTagEnum.enumValues[number];
type TypeTag = typeof typeTagEnum.enumValues[number];

@Injectable()
export class ProjectService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}
  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  async findAll(
    sortBy: 'yearAsc' | 'yearDesc', 
    showFeaturedOnly: boolean, 
    status?: StatusTag, 
    type?: TypeTag
  ) {
    const query = await this.db
      .select()
      .from(projects)
      .where(
        and(
          status ? eq(projects.status, status) : undefined,
          type ? eq(projects.type, type) : undefined,
          showFeaturedOnly ? eq(projects.featured, true) : undefined
        )
      )
      .orderBy(
        desc(projects.featured), 
        sortBy === "yearDesc" ? desc(projects.dateLaunched) : asc(projects.dateLaunched), 
      );
      
    return query;
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
