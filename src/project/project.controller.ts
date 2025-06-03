import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
  ParseIntPipe,
  BadRequestException 
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { statusTagEnum, typeTagEnum } from 'drizzle/schema';


type StatusTag = typeof statusTagEnum.enumValues[number];
type TypeTag = typeof typeTagEnum.enumValues[number];

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  async findAll(
    @Query('sort') sortBy: 'yearDesc' | 'yearAsc' = 'yearDesc', 
    @Query('status') status?: StatusTag,
    @Query('type') type?: TypeTag,
    @Query('featured', new DefaultValuePipe(false), new ParseBoolPipe()) showFeaturedOnly?: boolean, 
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe()) page?: number,
    @Query('limit', new DefaultValuePipe(10), new ParseIntPipe()) limit?: number,
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
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
