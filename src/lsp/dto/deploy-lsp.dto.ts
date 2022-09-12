import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DeployLspDto {
  @ApiProperty({
    description: "Node url for the network you wish to deploy to.",
    default: "https://rpc.sx.technology/"
  })
  url: string;

  @ApiProperty({
    description: "Gas price to use in GWEI.",
    default: 10
  })
  gasprice: number;

  @ApiProperty({
    description: "An account mnemonic you'd like to use."
  })
  mnemonic: string;

  @ApiProperty({
    description: "The desired name of the token pair."
  })
  pairName: string;

  @ApiProperty({
    description: "Timestamp that the contract will expire at."
  })
  expirationTimestamp: Date;

  @ApiProperty({
    description: "How many units of collateral are required to mint one pair of synthetic tokens."
  })
  collateralPerPair: number;

  @ApiProperty({
    description: "The approved price identifier to be used."
  })
  priceIdentifier: string;

  @ApiProperty({
    description: "The full-length name of the long token."
  })
  longSynthName: string;

  @ApiProperty({
    description: "Long token symbol."
  })
  longSynthSymbol: string;

  @ApiProperty({
    description: "The full-length name of the short token."
  })
  shortSynthName: string;

  @ApiProperty({
    description: "Short token symbol."
  })
  shortSynthSymbol: string;

  @ApiProperty({
    description: "Approved collateral currency to be used."
  })
  collateralToken: string;

  @ApiProperty({
    description: "Name of the financial product library type your contract will use to calculate the payment at expiry, such as RangeBond or Linear. Required if --financialProductLibraryAddress is not included."
  })
  @ApiPropertyOptional()
  fpl: string;

  @ApiProperty({
    description: "Lower bound of a price range for certain financial product libraries. Cannot be included if --strikePrice is specified."
  })
  @ApiPropertyOptional()
  lowerBound: string;

  @ApiProperty({
    description: "Upper bound of a price range for certain financial product libraries."
  })
  @ApiPropertyOptional()
  upperBound: string;

  @ApiProperty({
    description: "Proposal reward to be forwarded to the created contract to be used to incentivize price proposals."
  })
  @ApiPropertyOptional()
  proposerReward: string;

  @ApiProperty({
    description: "Additional bond proposer must post with the optimistic oracle. A higher bond makes incorrect disputes and proposals more costly."
  })
  @ApiPropertyOptional()
  optimisticOracleProposerBond: string;

  @ApiProperty({
    description: "If set to true, the LSP contract can request to be settled early by calling the optimistic oracle. If not needed, the parameter will be set to false.",
    default: false
  })
  @ApiPropertyOptional()
  enableEarlyExpiration: boolean;

  @ApiProperty({
    description: "Contract address providing settlement payout logic. Only required if a custom financial product library is used and --fpl is not included."
  })
  @ApiPropertyOptional()
  financialProductLibraryAddress: string;

  @ApiProperty({
    description: "Custom ancillary data to be passed along with the price request. If not needed, this flag can be excluded and will be left as a 0-length bytes array."
  })
  @ApiPropertyOptional()
  customAncillaryData: string;

  @ApiProperty({
    description: "Custom liveness window for disputing optimistic oracle price proposals in seconds. A longer liveness time provides more security, while a shorter one provides faster settlement. By default, this is set to 7200 seconds.",
    default: 7200
  })
  @ApiPropertyOptional()
  optimisticOracleLivenessTime: string;

  @ApiProperty({
    description: "Alias for lowerBound, used for certain financial product libraries with no upper bound. Cannot be included if --lowerBound is specified."
  })
  @ApiPropertyOptional()
  strikePrice: string;

  @ApiProperty({
    description: "The percentage of collateral per pair used as the floor. This parameter is used with the 'SuccessToken' fpl where the remaining percentage functions like an embedded call option."
  })
  @ApiPropertyOptional()
  basePercentage: string;

  @ApiProperty({
    description: "Boolean telling if the script should only simulate the transactions without sending them to the network."
  })
  @ApiPropertyOptional()
  simulate: boolean;

  @ApiProperty({
    description: ""
  })
  @ApiPropertyOptional()
  lspCreatorAddress: string;
}