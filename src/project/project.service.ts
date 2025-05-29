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
import { projects } from 'drizzle/schema';
import { eq } from 'drizzle-orm';
import { MinioService } from 'src/minio/minio.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
    private readonly miniIoService: MinioService,
    private readonly configService: ConfigService,
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

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    images: Express.Multer.File[],
  ) {
    try {
      const uploadResults = await Promise.all(
        images.map((file) =>
          this.miniIoService.uploadObject(
            file,
            this.configService.get<string>('IMAGE_BUCKET'),
          ),
        ),
      );

      return (
        await this.db
          .update(projects)
          .set({
            ...updateProjectDto,
            images: uploadResults.map((file) => file.url),
          })
          .where(eq(projects.id, id))
          .returning()
      )[0];
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
