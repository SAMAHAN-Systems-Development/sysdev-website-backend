import { Injectable } from '@nestjs/common';
import { CreateAlumnusDto } from './dto/create-alumnus.dto';
import { UpdateAlumnusDto } from './dto/update-alumnus.dto';

@Injectable()
export class AlumniService {
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
