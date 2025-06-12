import { ApiProperty } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateMemberDto extends CreateMemberDto {
  @ApiProperty({ type: String, description: 'photo link-url' })
  photo?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ type: String, description: 'Unique Email only' })
  email: string;
}

export class MulterClassMemberDtoUpdate extends UpdateMemberDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Single file upload',
  })
  newPhoto?: Express.Multer.File;
}
