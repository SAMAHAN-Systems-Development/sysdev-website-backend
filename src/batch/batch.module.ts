import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
