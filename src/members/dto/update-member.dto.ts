import { ApiProperty } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends CreateMemberDto {
  @ApiProperty({ type: String, description: 'photo link-url' })
  photo?: string;
}
