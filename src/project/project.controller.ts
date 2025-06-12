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
} from '@nestjs/common';
import { ProjectService } from './project.service';
import {
  CreateProjectDto,
  MulterClassCreateProjectDto,
} from './dto/create-project.dto';
import {
  MulterClassUpdateProjectDto,
  UpdateProjectDto,
} from './dto/update-project.dto';
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
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
type StatusTag = (typeof statusTagEnum.enumValues)[number];
type TypeTag = (typeof typeTagEnum.enumValues)[number];
@ApiTags('Projects')
@Controller('/api/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiBearerAuth('access-token')
  @ApiBody({ type: MulterClassCreateProjectDto })
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
  @UseInterceptors(FileFieldsInterceptor([{ name: 'newImages' }]))
  async create(
    @UploadedFiles() files: { newImages?: Express.Multer.File[] },
    @Body() createProjectDto: CreateProjectDto,
  ) {
    if (!files.newImages || files.newImages.length == 0) {
      throw new BadRequestException('At least one image file is required');
    }

    try {
      const project = await this.projectService.create(
        createProjectDto,
        files.newImages,
      );

      return {
        statusCode: 201,
        message: 'Project created successfully',
        data: project,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create project', {
        cause: error,
        description: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Get All Projects',
    description: 'No authorization at all',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieve all projects with pagination',
  })
  @ApiQuery({
    name: 'sortByYear',
    required: false,
    description: 'Sort projects by year ascending or descending',
    schema: {
      enum: ['yearDesc', 'yearAsc'],
      default: 'yearDesc',
    },
    example: 'yearDesc',
  })
  @ApiQuery({
    name: 'sortByName',
    required: false,
    description: 'Sort projects by year ascending or descending',
    schema: {
      enum: ['desc', 'asc'],
      default: 'desc',
    },
    example: 'desc',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter projects by status',
    enum: statusTagEnum.enumValues,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter projects by type',
    enum: typeTagEnum.enumValues,
  })
  @ApiQuery({
    name: 'featured',
    required: false,
    description: 'Show only featured projects',
    schema: {
      type: 'boolean',
      default: false,
    },
    example: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (pagination), minimum 1',
    schema: {
      type: 'integer',
      default: 1,
      minimum: 1,
    },
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of projects per page, between 1 and 100',
    schema: {
      type: 'integer',
      default: 10,
      minimum: 1,
      maximum: 100,
    },
    example: 10,
  })
  @Get()
  async findAll(
    @Query('sortByYear') sortByYear: 'yearDesc' | 'yearAsc' = 'yearDesc',
    @Query('sortByName') sortByName: 'desc' | 'asc' = 'desc',
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

    try {
      const projects = await this.projectService.findAll(
        sortByYear,
        sortByName,
        status,
        type,
        showFeaturedOnly,
        page,
        limit,
      );

      return { page: page, limit: limit, data: projects, statusCode: 200 };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve projects', {
        cause: error,
        description: error.message,
      });
    }
  }

  @ApiOperation({
    summary: 'Get Project By ID',
    description:
      'No Authorization at all, Gets more detailed project information with collaboratorByRoles',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrive all projects with pagination',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Provide Project by the provided ID, with collaboratorByroles',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe, ProjectExistsPipe) id: string) {
    try {
      const res = await this.projectService.findOne(+id);
      return {
        data: res,
        statusCode: 200,
        message: `Successfuly find project with ID #${id}`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve project', {
        cause: error,
        description: error.message,
      });
    }
  }

  @ApiBearerAuth('access-token')
  @ApiBody({ type: MulterClassUpdateProjectDto })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update Project',
    description: 'Unauthorized: Either auth bearer expired or not provided jwt',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated Project and Returning updated Project',
    type: UpdateProjectDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Update Project by the provided ID',
  })
  @UseGuards(JwtAuthGuard)
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
      throw new InternalServerErrorException('Failed to update project', {
        cause: error,
        description: error.message,
      });
    }
  }

  @ApiBearerAuth('access-token')
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
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Delete Project by the provided ID',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe, ProjectExistsPipe) id: string) {
    try {
      await this.projectService.remove(+id);
      return {
        statusCode: 200,
        message: `Project with ID #${id} deleted successfully`,
        data: undefined,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Failed to delete project',
        data: undefined,
        error: error.message,
      };
    }
  }
}
