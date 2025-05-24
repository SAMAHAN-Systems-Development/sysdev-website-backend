import { Inject, Injectable } from '@nestjs/common';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import {
  DATABASE_CONNECTION,
  Database,
} from 'src/database/database-connection';

@Injectable()
export class BatchService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}
  create(createBatchDto: CreateBatchDto) {
    return 'This action adds a new batch';
  }

  findAll() {
    return `This action returns all batch`;
  }

  findOne(id: number) {
    return `This action returns a #${id} batch`;
  }

  update(id: number, updateBatchDto: UpdateBatchDto) {
    return `This action updates a #${id} batch`;
  }

  remove(id: number) {
    return `This action removes a #${id} batch`;
  }
}
