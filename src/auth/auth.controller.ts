import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPayloadDto } from './dto/auth.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: AuthPayloadDto })
  @ApiOperation({
    summary: 'Login user',
    description: 'Provide necessary information as json and receive a token',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 201,
    description: 'Created Bearer Token',
    type: AuthPayloadDto,
  })
  @Post('login')
  @UseGuards(LocalGuard)
  login(@Req() req: Request) {
    return req.user;
  }
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Retrive Logged in user',
    description: 'Provide information of user',
  })
  @ApiResponse({ status: 200, description: 'Ok' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Either auth bearer expired or not provided jwt',
  })
  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    return req.user;
  }
}
