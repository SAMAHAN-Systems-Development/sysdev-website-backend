import { ApiProperty } from '@nestjs/swagger';

export class AuthPayloadDto {
  @ApiProperty({ type: String })
  email: string;
  @ApiProperty({ type: String })
  password: string;
}
