import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto, MulterClassMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemberExistsPipe } from './middleware/memberExisits.middleware';
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
@ApiTags('Members')
@Controller('/api/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @ApiBearerAuth('access-token')
  @ApiBody({ type: MulterClassMemberDto })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create Member',
    description: 'Unauthorized: Either auth bearer expired or not provided jwt',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created Member and Returning Created Members',
    type: CreateMemberDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized:' })
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @UploadedFile() photo: Express.Multer.File,
    @Body() createMemberDto: CreateMemberDto,
  ) {
    return this.membersService.create(createMemberDto, photo);
  }

  @ApiOperation({
    summary: 'Get All Member',
    description: 'Get All Member',
  })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all member data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized:' })
  @ApiQuery({
    name: 'role',
    required: false,
    type: Number,
    description: 'Filter members by role ID',
  })
  @Get()
  findAll(@Query('role') role?: number) {
    return this.membersService.findAll(role);
  }

  @ApiOperation({
    summary: 'Find one Member',
    description: 'Provide member detailed member',
  })
  @ApiResponse({
    status: 200,
    description: 'Members Retrieved',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Get Member by the provided ID',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe, MemberExistsPipe) id: string) {
    return this.membersService.findOne(+id);
  }

  @ApiBearerAuth('access-token')
  @ApiBody({ type: MulterClassMemberDto })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update Member',
    description: 'Update member data and return the member updated data',
  })
  @ApiResponse({
    status: 200,
    description:
      'OK: Successfully Updated Member and Returning Updated Members',
    type: UpdateMemberDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized:' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Update Member by the provided ID',
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('photo'))
  update(
    @Param('id', ParseIntPipe, MemberExistsPipe) id: number,
    @UploadedFile() photo: Express.Multer.File,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto, photo);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete Member',
    description: 'Soft Delete member data and With a succesfull message',
  })
  @ApiResponse({
    status: 200,
    description: 'OK: Successfully Deleted Member',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized:' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Delete Member by the provided ID',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe, MemberExistsPipe) id: string) {
    return this.membersService.remove(+id);
  }
}
