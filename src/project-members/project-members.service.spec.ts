import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMembersService } from './project-members.service';

describe('ProjectMembersService', () => {
  let service: ProjectMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectMembersService],
    }).compile();

    service = module.get<ProjectMembersService>(ProjectMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
