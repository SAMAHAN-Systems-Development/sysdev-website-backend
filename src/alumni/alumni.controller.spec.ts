import { Test, TestingModule } from '@nestjs/testing';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';

describe('AlumniController', () => {
  let controller: AlumniController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlumniController],
      providers: [AlumniService],
    }).compile();

    controller = module.get<AlumniController>(AlumniController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
