import { PartialType } from '@nestjs/mapped-types';
import { CreateAlumnusDto } from './create-alumnus.dto';

export class UpdateAlumnusDto extends PartialType(CreateAlumnusDto) {}
