import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
  ParseIntPipe,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { statusTagEnum, typeTagEnum } from 'drizzle/schema';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProjectExistsPipe } from './middlewares/projectExists.middleware';

type StatusTag = (typeof statusTagEnum.enumValues)[number];
type TypeTag = (typeof typeTagEnum.enumValues)[number];

@Controller('/api/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  async create(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    if (!files.images || files.images.length == 0) {
      throw new BadRequestException('At least one image file is required');
    }

    const project = await this.projectService.create(
      createProjectDto,
      files.images,
    );

    return {
      message: 'Project created successfully',
      data: project,
    };
  }

  @Get()
  async findAll(
    @Query('sort') sortBy: 'yearDesc' | 'yearAsc' = 'yearDesc',
    @Query('status') status?: StatusTag,
    @Query('type') type?: TypeTag,
    @Query('featured', new DefaultValuePipe(false), new ParseBoolPipe())
    showFeaturedOnly?: boolean,
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe()) page?: number,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe())
    limit?: number,
  ) {
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const projects = await this.projectService.findAll(
      sortBy,
      status,
      type,
      showFeaturedOnly,
      page,
      limit,
    );

    return projects;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe, ProjectExistsPipe) id: string) {
    return this.projectService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'newImages' }]))
  async update(
    @Param('id', ParseIntPipe, ProjectExistsPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files: { newImages?: Express.Multer.File[] },
  ) {
    try {
      return {
        message: 'Project updated successfully',
        data: await this.projectService.update(
          id,
          updateProjectDto,
          files.newImages,
        ),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update project', {
        cause: error,
        description: error.message,
      });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe, ProjectExistsPipe) id: string) {
    return this.projectService.remove(+id);
  }
}
