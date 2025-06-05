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
  @ApiProperty({ type: [Number], example: [0, 1] })
  roleIds: number[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ type: String })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  @IsEmailExists({ message: 'Email already exists' })
  @ApiProperty({ type: String })
  email: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({ type: Boolean })
  isVisible?: boolean;
}
export class MulterClassDto extends CreateMemberDto {
  // @ApiProperty({
  //   type: 'array',
  //   items: {
  //     type: 'string',
  //     format: 'binary',
  //   },
  //   description: 'Project images',
  //   required: false,
  // })
  // images?: Express.Multer.File[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Single file upload',
  })
  photo?: Express.Multer.File;
}
