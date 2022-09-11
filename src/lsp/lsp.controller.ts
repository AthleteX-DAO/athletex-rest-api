import { Controller, Post } from '@nestjs/common';
import { LspService } from './lsp.service';
@Controller('lsp')
export class LspController {
  constructor(private readonly lspService: LspService) {}
}
