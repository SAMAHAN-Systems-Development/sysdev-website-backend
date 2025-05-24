import { Module } from '@nestjs/common';
import { AlumniService } from './alumni.service';
import { AlumniController } from './alumni.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AlumniController],
  providers: [AlumniService],
})
export class AlumniModule {}
