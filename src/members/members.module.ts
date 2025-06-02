import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MinioService } from 'src/minio/minio.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MembersController],
  providers: [MembersService, MinioService],
})
export class MembersModule {}
