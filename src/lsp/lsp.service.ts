import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeployLspDto } from './dto/deploy-lsp.dto';
import { LSP } from './entities/lsp.entity';
import { getAbi, getAddress } from '@uma/contracts-node';
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

@Injectable()
export class LspService {
  async getWeb3(params: DeployLspDto) {
    const url = params.url || 'http://localhost:8545';

    // See HDWalletProvider documentation: https://www.npmjs.com/package/@truffle/hdwallet-provider.
    const hdwalletOptions = {
      mnemonic: {
        phrase: params.mnemonic,
      },
      providerOrUrl: url,
      addressIndex: 0, // Change this to use the nth account.
    };

    // Initialize web3 with an HDWalletProvider if a mnemonic was provided. Otherwise, just give it the url.
    return new Web3(
      params.mnemonic ? new HDWalletProvider(hdwalletOptions) : url,
    );
  }

  async deploy(params: DeployLspDto): Promise<LSP> {
    const lsp = new LSP();
    const web3 = await this.getWeb3(params);

    const ancillaryData = params.customAncillaryData
      ? params.customAncillaryData
      : '';
    const proposerReward = params.proposerReward ? params.proposerReward : 0;
    const livenessTime = params.optimisticOracleLivenessTime
      ? params.optimisticOracleLivenessTime
      : 7200;
    const earlyExpiration = params.enableEarlyExpiration
      ? params.enableEarlyExpiration
      : false;

    const { utf8ToHex, padRight } = web3.utils;
    
    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0)
      throw new HttpException(
        'No accounts. Must provide mnemonic or node must have unlocked accounts.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    const account = accounts[0];
    const networkId = await web3.eth.net.getId();
    lsp.networkId = networkId;

    // Grab collateral decimals.
    const collateral = new web3.eth.Contract(
      getAbi('IERC20Standard'),
      params.collateralToken,
    );
    const decimals = (await collateral.methods.decimals().call()).toString();
    lsp.decimals = decimals;

    // Get the final fee for the collateral type to use as default proposer bond.
    const storeAddress = await getAddress('Store', networkId);
    const store = new web3.eth.Contract(getAbi('Store'), storeAddress);
    const finalFee = (
      await store.methods.computeFinalFee(params.collateralToken).call()
    ).toString();
    lsp.finalFee = finalFee;

    const proposerBond = params.optimisticOracleProposerBond
      ? params.optimisticOracleProposerBond
      : finalFee;

    // Set FPL.
    const fpl = params.fpl
      ? await getAddress(
          (params.fpl + 'LongShortPairFinancialProductLibrary') as any,
          networkId,
        )
      : '';
    lsp.fpl = fpl;

    const financialProductLibrary = params.financialProductLibraryAddress
      ? params.financialProductLibraryAddress.toString()
      : fpl;
    if (params.fpl && !params.lowerBound && !params.strikePrice)
      throw new HttpException(
        '--lowerBound or --strikePrice required',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    if (
      (params.fpl == 'RangeBond' || params.fpl == 'Linear') &&
      !params.upperBound
    )
      throw new HttpException(
        '--upperBound required',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    if (params.fpl == 'SuccessToken' && !params.basePercentage)
      throw new HttpException(
        '--basePercentage required',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    if (params.lowerBound && params.strikePrice)
      throw new HttpException(
        'you may specify --lowerBound or --strikePrice, but not both',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    // LSP parameters. Pass in arguments to customize these.
    const lspParams = {
      pairName: params.pairName,
      expirationTimestamp: params.expirationTimestamp, // Timestamp that the contract will expire at.
      collateralPerPair: params.collateralPerPair,
      priceIdentifier: padRight(
        utf8ToHex(params.priceIdentifier.toString()),
        64,
      ), // Price identifier to use.
      longSynthName: params.longSynthName,
      longSynthSymbol: params.longSynthSymbol,
      shortSynthName: params.shortSynthName,
      shortSynthSymbol: params.shortSynthSymbol,
      collateralToken: params.collateralToken.toString(), // Collateral token address.
      financialProductLibrary: financialProductLibrary,
      customAncillaryData: utf8ToHex(ancillaryData), // Default to empty bytes array if no ancillary data is passed.
      proposerReward: proposerReward, // Default to 0 if no proposer reward is passed.
      optimisticOracleLivenessTime: livenessTime,
      optimisticOracleProposerBond: proposerBond,
      enableEarlyExpiration: earlyExpiration, // Default to false if true is not passed
    };

    lsp.params = lspParams;

    const lspCreatorAddress = params.lspCreatorAddress
      ? params.lspCreatorAddress
      : await getAddress('LongShortPairCreator', networkId);
    lsp.lspCreatorAddress = lspCreatorAddress;

    const lspCreator = new web3.eth.Contract(
      getAbi('LongShortPairCreator'),
      lspCreatorAddress,
    );

    // Transaction parameters
    const transactionOptions = {
      gas: 10000000, // 10MM is very high. Set this lower if you only have < 2 ETH or so in your wallet.
      gasPrice: params.gasprice * 1000000000, // gasprice arg * 1 GWEI
      from: account,
    };

    lsp.transactionOptions = transactionOptions;

    // Simulate transaction to test before sending to the network.
    console.log('Simulating Deployment...');
    await lspCreator.methods
      .createLongShortPair(lspParams)
      .call(transactionOptions);

    // Since the simulated transaction succeeded, send the real one to the network.
    let address;
    if (!params.simulate) {
      const result = await lspCreator.methods
        .createLongShortPair(lspParams)
        .send(transactionOptions);
      address = result.events.CreatedLongShortPair.returnValues.longShortPair;
      lsp.address = address;
      lsp.transactionHash = result.transactionHash;
    }

    // Set the FPL parameters.
    if (fpl) {
      // Set the deployed FPL address and lowerBound.
      const fplName = params.fpl + 'LongShortPairFinancialProductLibrary';
      lsp.fplName = fplName;
      const deployedFPL = new web3.eth.Contract(getAbi(fplName as any), fpl);
      const lowerBound = params.lowerBound
        ? params.lowerBound
        : params.strikePrice;
      // Set parameters depending on FPL type.
      if (
        params.fpl == 'BinaryOption' ||
        params.fpl == 'CappedYieldDollar' ||
        params.fpl == 'CoveredCall' ||
        params.fpl == 'SimpleSuccessToken'
      ) {
        const fplParams = [address, lowerBound];
        lsp.fplParams = {
          address: fplParams[0],
          lowerBound: fplParams[1],
        };
        if (!params.simulate) {
          const { transactionHash } = await deployedFPL.methods
            .setLongShortPairParameters(...fplParams)
            .send(transactionOptions);
          lsp.fplTransactionHash = transactionHash;

          console.log(
            'Financial product library parameters set in transaction:',
            transactionHash,
          );
        }
      }
      if (params.fpl == 'RangeBond' || params.fpl == 'Linear') {
        const upperBound = params.upperBound;
        const fplParams = [address, upperBound, lowerBound];
        lsp.fplParams = {
          address: fplParams[0],
          upperBound: fplParams[1],
          lowerBound: fplParams[2],
        };
        if (!params.simulate) {
          const { transactionHash } = await deployedFPL.methods
            .setLongShortPairParameters(...fplParams)
            .send(transactionOptions);
          lsp.fplTransactionHash = transactionHash;
          console.log(
            'Financial product library parameters set in transaction:',
            transactionHash,
          );
        }
      }
      if (params.fpl == 'SuccessToken') {
        const basePercentage = params.basePercentage;
        const fplParams = [address, lowerBound, basePercentage];
        lsp.fplParams = {
          address: fplParams[0],
          lowerBound: fplParams[1],
          basePercentage: fplParams[2],
        };
        if (!params.simulate) {
          const { transactionHash } = await deployedFPL.methods
            .setLongShortPairParameters(...fplParams)
            .send(transactionOptions);
          lsp.fplTransactionHash = transactionHash;
          console.log(
            'Financial product library parameters set in transaction:',
            transactionHash,
          );
        }
      }
    }

    return lsp;
  }
}
