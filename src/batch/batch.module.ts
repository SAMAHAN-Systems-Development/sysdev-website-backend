import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';

@Module({
  controllers: [BatchController],
  providers: [BatchService],
})
export class BatchModule {}
