import { Test, TestingModule } from '@nestjs/testing';
import { LspController } from './lsp.controller';

describe('LspController', () => {
  let controller: LspController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LspController],
    }).compile();

    controller = module.get<LspController>(LspController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
