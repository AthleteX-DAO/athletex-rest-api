import { ApiProperty } from '@nestjs/swagger';

export class LSP {
  @ApiProperty()
  networkId: number;

  @ApiProperty()
  decimals: string;

  @ApiProperty()
  finalFee: string;

  @ApiProperty()
  fpl: string;

  @ApiProperty()
  params: object;

  @ApiProperty()
  lspCreatorAddress: string;

  @ApiProperty()
  transactionOptions: object;

  @ApiProperty()
  transactionHash: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  fplName: string;

  @ApiProperty()
  fplParams: object;

  @ApiProperty()
  fplTransactionHash: string;
}