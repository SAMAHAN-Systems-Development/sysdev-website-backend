import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProjectExistsPipe } from './middlewares/projectExists.middleware';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('/api/projects')
@Controller('projects')
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
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe, ProjectExistsPipe) id: string) {
    return this.projectService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    return {
      message: 'Project updated successfully',
      data: await this.projectService.update(
        id,
        updateProjectDto,
        files.images,
      ),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe, ProjectExistsPipe) id: string) {
    return this.projectService.remove(+id);
  }
}
