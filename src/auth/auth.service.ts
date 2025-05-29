import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { eq } from 'drizzle-orm';
import { users } from 'drizzle/schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async validateUser({ username, password }: AuthPayloadDto) {
    let selectedUser;
    try {
      selectedUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, username));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const findUser = selectedUser[0];
    if (!findUser) throw new UnauthorizedException('User not found');
    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwtService.sign({ email: findUser.email });
    return {
      access_token: token,
    };
  }
}
