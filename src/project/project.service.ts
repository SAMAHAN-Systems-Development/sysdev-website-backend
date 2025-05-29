import { Inject, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { projects } from 'drizzle/schema';
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
