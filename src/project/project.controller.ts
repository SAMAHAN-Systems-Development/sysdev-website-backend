import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    if (!files.images || files.images.length == 0) {
      throw new BadRequestException('At least one image file is required');
    }

    return {
      message: 'Project updated successfully',
      data: await this.projectService.update(
        +id,
        updateProjectDto,
        files.images,
      ),
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
