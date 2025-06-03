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
  ParseBoolPipe,
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
    @Query('featured', new ParseBoolPipe({ optional: true })) showFeaturedOnly: boolean = false, 
    @Query('status') status?: StatusTag,
    @Query('type') type?: TypeTag,
  ) {

    const projects = await this.projectService.findAll(
      sortBy,
      showFeaturedOnly,
      status,
      type,
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
