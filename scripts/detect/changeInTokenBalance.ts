/**
 * Script to find change in on-chain token balance of an account between two block numbers
 * Run using `ts-node scripts/detect/changeInTokenBalance.ts`
 */
import SDK, { util } from '@zeitgeistpm/sdk';
import { Tools } from '../../src/mappings/util';

// Modify values as per requirement
const WS_NODE_URL = `wss://bsr.zeitgeist.pm`;
const ACCOUNT_ID = `dE1VdxVn8xy7HFNWfF1a8utYcbVN7BHNvTzRndwpRiNfEk9Co`;
const FROM_BLOCK_NUM = 1388585;
const TO_BLOCK_NUM = 1402375;
const MARKET_ID = 44;
const ASSET_INDEX = 0;

const findChangeInTokenBalance = async () => {
  const sdk = await Tools.getSDK(WS_NODE_URL);
  let fromBlockNum = FROM_BLOCK_NUM;
  let toBlockNum = TO_BLOCK_NUM + 1; // Includes `TO_BLOCK_NUM` for querying
  let fromBalance = await getBalanceAt(sdk, fromBlockNum);
  const startBalance = BigInt(fromBalance);

  // Inspired by binary search algorithm
  while (fromBlockNum <= toBlockNum) {
    let midBlockNum = Math.floor((fromBlockNum + toBlockNum) / 2);
    const midBalance = await getBalanceAt(sdk, midBlockNum);

    if (fromBalance.toString() !== midBalance.toString()) {
      toBlockNum = midBlockNum;
    } else {
      fromBlockNum = midBlockNum;
      fromBalance = midBalance;
    }

    // When all block numbers are covered
    if (toBlockNum - fromBlockNum == 1) {
      const endBalance = BigInt(midBalance);
      if (endBalance - startBalance !== BigInt(0)) {
        console.log(`\nAddition of ${endBalance - startBalance} units 
          detected on-chain at #${toBlockNum} for ${ACCOUNT_ID}`);
      } else {
        console.log(`\nNo change detected in on-chain balance 
          between #${FROM_BLOCK_NUM} and #${TO_BLOCK_NUM} for ${ACCOUNT_ID}`);
      }
      sdk.api.disconnect();
      process.exit(1);
    }
  }
};

// To query chain for account balance as on block number
const getBalanceAt = async (sdk: SDK, blockNumber: number) => {
  const blockHash = await sdk.api.rpc.chain.getBlockHash(blockNumber);
  const data = (await sdk.api.query.tokens.accounts.at(
    blockHash,
    ACCOUNT_ID,
    util.AssetIdFromString(`[${MARKET_ID},${ASSET_INDEX}]`)
  )) as any;
  console.log(`Balance fetched from #${blockNumber}`);
  return data.free.toString();
};

findChangeInTokenBalance();
