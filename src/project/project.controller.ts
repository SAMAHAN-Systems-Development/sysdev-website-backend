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
import { CreateProjectDto, MulterClassDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { statusTagEnum, typeTagEnum } from 'drizzle/schema';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProjectExistsPipe } from './middlewares/projectExists.middleware';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
type StatusTag = (typeof statusTagEnum.enumValues)[number];
type TypeTag = (typeof typeTagEnum.enumValues)[number];
@ApiTags('Projects')
@Controller('/api/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiBearerAuth('access-token')
  @ApiBody({ type: MulterClassDto })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create Project',
    description: 'Unauthorized: Either auth bearer expired or not provided jwt',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created Project and Returning Created Project',
    type: CreateProjectDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({
    summary: 'Get All Projects',
    description: 'No authorization at all',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrive all projects with pagination',
  })
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

  @ApiOperation({
    summary: 'Get Project By ID',
    description: 'No Authorization at all',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrive all projects with pagination',
  })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe, ProjectExistsPipe) id: string) {
    return this.projectService.findOne(+id);
  }

  @ApiBearerAuth('access-token')
  @ApiBody({ type: MulterClassDto })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update Project',
    description: 'Unauthorized: Either auth bearer expired or not provided jwt',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated Project and Returning updated Project',
    type: CreateProjectDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images' }]))
  async update(
    @Param('id', ParseIntPipe, ProjectExistsPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    try {
      return {
        message: 'Project updated successfully',
        data: await this.projectService.update(
          id,
          updateProjectDto,
          files.images,
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

  @ApiBearerAuth('access-token')
  @ApiBody({ type: MulterClassDto })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Delete Project',
    description: 'Unauthorized: Either auth bearer expired or not provided jwt',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted Project and Returning deleted Project',
    type: CreateProjectDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe, ProjectExistsPipe) id: string) {
    return this.projectService.remove(+id);
  }
}
