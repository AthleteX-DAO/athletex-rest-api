import { Module } from '@nestjs/common';
import { LspController } from './lsp.controller';
import { LspService } from './lsp.service';

@Module({
  controllers: [LspController],
  providers: [LspService]
})
export class LspModule {}
