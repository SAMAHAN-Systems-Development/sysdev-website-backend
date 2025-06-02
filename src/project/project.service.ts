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

  findAll() {
    return this.db.select().from(projects);
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    images?: Express.Multer.File[],
  ) {
    const project = (
      await this.db.select().from(projects).where(eq(projects.id, id)).execute()
    )[0];

    if (!project) {
      throw new NotFoundException(`Project with id "${id}" does not exist`);
    }

    const unknownImages = updateProjectDto.images.filter(
      (image) => !project.images.includes(image),
    );

    if (unknownImages.length > 0) {
      throw new BadRequestException(
        'Payload images list contains unknown links',
      );
    }

    const uploadedUrls = images?.length
      ? await Promise.all(
          images.map((file) =>
            this.miniIoService.uploadObject(
              file,
              this.configService.get<string>('IMAGE_BUCKET'),
            ),
          ),
        ).then((results) => results.map((r) => r.url))
      : [];

    const [updatedProject] = await this.db
      .update(projects)
      .set({
        ...updateProjectDto,
        dateLaunched: new Date(updateProjectDto.dateLaunched),
        images: updateProjectDto.images.concat(uploadedUrls),
      })
      .where(eq(projects.id, id))
      .returning();

    return updatedProject;
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
