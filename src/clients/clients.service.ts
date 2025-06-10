import { Inject, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';
import { clients } from 'drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async create(createClientDto: CreateClientDto) {
    return await this.db
      .insert(clients)
      .values({ ...createClientDto })
      .returning();
  }

  findAll() {
    return `This action returns all clients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} client`;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    return await this.db
      .update(clients)
      .set({ ...updateClientDto })
      .where(eq(clients.id, id))
      .returning();
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }
}
