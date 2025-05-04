import { Test, TestingModule } from '@nestjs/testing';
import { AlumniService } from './alumni.service';

describe('AlumniService', () => {
  let service: AlumniService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlumniService],
    }).compile();

    service = module.get<AlumniService>(AlumniService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
