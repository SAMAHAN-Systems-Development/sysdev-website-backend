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
  @UseInterceptors(FileInterceptor('newPhoto'))
  async create(
    @UploadedFile() newPhoto: Express.Multer.File,
    @Body() createMemberDto: CreateMemberDto,
  ) {
    try {
      const res = await this.membersService.create(createMemberDto, newPhoto);
      return {
        statusCode: 201,
        message: 'Succesfully Created Members',
        data: res,
      };
    } catch (error) {
      return error;
    }
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
  async findAll(@Query('role') role?: number) {
    try {
      const res = await this.membersService.findAll(role);
      return { status: 200, message: 'Successfully Fetch Data', data: res };
    } catch (error) {
      return error;
    }
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
  async findOne(@Param('id', ParseIntPipe, MemberExistsPipe) id: string) {
    try {
      const res = await this.membersService.findOne(+id);
      return {
        status: 200,
        message: `Successfully Fetch Data by Id #${id}`,
        data: res,
      };
    } catch (error) {
      return error;
    }
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
  @UseInterceptors(FileInterceptor('newPhoto'))
  async update(
    @Param('id', ParseIntPipe, MemberExistsPipe) id: number,
    @UploadedFile() newPhoto: Express.Multer.File,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    try {
      const res = await this.membersService.update(
        id,
        updateMemberDto,
        newPhoto,
      );
      return {
        status: 200,
        message: `Successfully Updated Data by Id #${id}`,
        data: res,
      };
    } catch (error) {
      return error;
    }
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
  async remove(@Param('id', ParseIntPipe, MemberExistsPipe) id: string) {
    try {
      const res = await this.membersService.remove(+id);
      return { statusCode: 200, message: res, data: undefined };
    } catch (error) {
      return error;
    }
  }
}
