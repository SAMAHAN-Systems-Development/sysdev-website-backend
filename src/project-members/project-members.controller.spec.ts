import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMembersController } from './project-members.controller';
import { ProjectMembersService } from './project-members.service';

describe('ProjectMembersController', () => {
  let controller: ProjectMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectMembersController],
      providers: [ProjectMembersService],
    }).compile();

    controller = module.get<ProjectMembersController>(ProjectMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
