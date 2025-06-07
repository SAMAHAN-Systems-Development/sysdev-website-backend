import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsEmailExists } from '../decorators/IsEmailExists.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @ApiProperty({
    type: [Number],
    example: [0, 1],
    description:
      'Provide the role ID and not name. On multipart it should look like roleIds[0], roleIds[1], roleIds[2]',
  })
  roleIds: number[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ type: String, description: 'Member name' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmailExists({ message: 'Email already exists' })
  @ApiProperty({ type: String, description: 'Unique Email only' })
  email: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({
    type: Boolean,
    description: 'This is the visibility of the member (true or false)',
  })
  isVisible?: boolean;
}
export class MulterClassMemberDto extends CreateMemberDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Single file upload',
  })
  newPhoto?: Express.Multer.File;
}
