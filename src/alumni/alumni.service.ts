import { Inject, Injectable } from '@nestjs/common';
import { CreateAlumnusDto } from './dto/create-alumnus.dto';
import { UpdateAlumnusDto } from './dto/update-alumnus.dto';
import {
  Database,
  DATABASE_CONNECTION,
} from 'src/database/database-connection';

@Injectable()
export class AlumniService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}
  create(createAlumnusDto: CreateAlumnusDto) {
    return 'This action adds a new alumnus';
  }

  findAll() {
    return `This action returns all alumni`;
  }

  findOne(id: number) {
    return `This action returns a #${id} alumnus`;
  }

  update(id: number, updateAlumnusDto: UpdateAlumnusDto) {
    return `This action updates a #${id} alumnus`;
  }

  remove(id: number) {
    return `This action removes a #${id} alumnus`;
  }
}
