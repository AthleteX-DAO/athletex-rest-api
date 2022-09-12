import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeployLspDto } from './dto/deploy-lsp.dto';
import { LSP } from './entities/lsp.entity';
import { LspService } from './lsp.service';

@ApiTags('LongShortPair')
@Controller('lsp')
export class LspController {
  constructor(private readonly lspService: LspService) {}

  @Post('deploy')
  @ApiOperation({ summary: 'Deloy LSP contract' })
  async deploy(@Body() params: DeployLspDto): Promise<LSP> {
    return this.lspService.deploy(params);
  }
}
