import {
  PipeTransform,
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { members } from 'drizzle/schema';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class MemberExistsPipe implements PipeTransform {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async transform(value: number) {
    const member = await this.db
      .select()
      .from(members)
      .where(and(eq(members.id, value)));
    if (!member[0]) {
      throw new NotFoundException(`Member with ID ${value} not found`);
    }
    if (member[0].deletedAt) {
      throw new BadRequestException(
        `Member with ID ${value} is already deleted`,
      );
    }
    return value;
  }
}
