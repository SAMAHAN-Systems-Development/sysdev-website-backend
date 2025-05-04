import { Injectable } from '@nestjs/common';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchService {
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
