import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @ApiProperty({ type: String, description: 'Member name' })
  name: string;
}
