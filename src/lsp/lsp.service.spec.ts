import { Test, TestingModule } from '@nestjs/testing';
import { LspService } from './lsp.service';

describe('LspService', () => {
  let service: LspService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LspService],
    }).compile();

    service = module.get<LspService>(LspService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
