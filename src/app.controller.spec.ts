import { Test, TestingModule } from '@nestjs/testing';
import { Controller } from './app.controller';

describe('Controller', () => {
  let controller: Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Controller],
    }).compile();

    controller = module.get<Controller>(Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
