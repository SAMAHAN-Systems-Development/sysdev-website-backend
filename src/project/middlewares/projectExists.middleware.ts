import {
  PipeTransform,
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { projects } from 'drizzle/schema';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ProjectExistsPipe implements PipeTransform {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async transform(value: number) {
    const project = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, value)));
    if (!project[0]) {
      throw new NotFoundException(`Project with ID ${value} not found`);
    }
    if (project[0].deletedAt) {
      throw new BadRequestException(
        `Project with ID ${value} is already deleted`,
      );
    }
    return value;
  }
}
