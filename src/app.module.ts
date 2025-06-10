import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { MembersModule } from './members/members.module';
import { ProjectMembersModule } from './project-members/project-members.module';
import { ProjectModule } from './project/project.module';
import { BatchModule } from './batch/batch.module';
import { EventsModule } from './events/events.module';
import { AlumniModule } from './alumni/alumni.module';
import { BlogsModule } from './blogs/blogs.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MinioModule } from './minio/minio.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsService } from './clients/clients.service';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    RolesModule,
    MembersModule,
    ProjectMembersModule,
    ProjectModule,
    BatchModule,
    EventsModule,
    AlumniModule,
    BlogsModule,
    MinioModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ClientsService],
})
export class AppModule {}
