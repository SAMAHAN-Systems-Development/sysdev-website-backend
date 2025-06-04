import { ApiProperty } from '@nestjs/swagger';

export class AuthPayloadDto {
  @ApiProperty({
    type: String,
    example: 'admin@admin.com',
    description: 'User email',
  })
  email: string;
  @ApiProperty({
    type: String,
    example: 'admin',
    description: 'secret password',
  })
  password: string;
}
