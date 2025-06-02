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
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemberExistsPipe } from './middleware/memberExisits.middleware';
@Controller('/api/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

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

  @Get()
  findAll(@Query('role') role?: number) {
    return this.membersService.findAll(role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe, MemberExistsPipe) id: string) {
    return this.membersService.findOne(+id);
  }

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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe, MemberExistsPipe) id: string) {
    return this.membersService.remove(+id);
  }
}
