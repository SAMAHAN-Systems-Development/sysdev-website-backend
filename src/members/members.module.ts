import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MinioService } from 'src/minio/minio.service';
import { IsEmailExistsConstraints } from './decorators/IsEmailExists.decorator';
@Module({
  imports: [DatabaseModule],
  controllers: [MembersController],
  providers: [MembersService, MinioService, IsEmailExistsConstraints],
})
export class MembersModule {}
