import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LspModule } from './lsp/lsp.module';

@Module({
  imports: [LspModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
