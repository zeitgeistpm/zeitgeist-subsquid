/** 
 * Script to find change in on-chain Ztg balance of an account between two block numbers
 * Run using `ts-node scripts/detect/changeInBalance.ts`
 */
import { AccountInfo } from "@polkadot/types/interfaces/system";
import SDK from "@zeitgeistpm/sdk";
import { Tools } from "../../src/mappings/util"

// Modify values as per requirement
const WS_NODE_URL = `wss://bsr.zeitgeist.pm`;
const ACCOUNT_ID = `dE4NbK6XC4dJEkjU5erpDNj2ydMh1fMNw8ug7xNgzTxqFo5iW`;
const FROM_BLOCK_NUM = 729171;
const TO_BLOCK_NUM = 736371;

const findChangeInBalance = async () => {
  const sdk = await Tools.getSDK(WS_NODE_URL);
  let fromBlockNum = FROM_BLOCK_NUM;
  let toBlockNum = TO_BLOCK_NUM + 1; // Includes `TO_BLOCK_NUM` for querying
  let fromBalance = await getBalanceAt(sdk, fromBlockNum);
  const startBalance = fromBalance.toBigInt();

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
      const endBalance = midBalance.toBigInt();
      if (endBalance - startBalance !== BigInt(0)) {
        console.log(`\nAddition of ${endBalance - startBalance} units detected on-chain at #${toBlockNum} for ${ACCOUNT_ID}`);
      } else {
        console.log(`\nNo change detected in on-chain balance between #${FROM_BLOCK_NUM} and #${TO_BLOCK_NUM} for ${ACCOUNT_ID}`)
      }
      sdk.api.disconnect();
      process.exit(1);
    }
  }
}

// To query chain for account balance as on block number
const getBalanceAt = async (sdk: SDK, blockNumber: number) => {
  const blockHash = await sdk.api.rpc.chain.getBlockHash(blockNumber);
  const {data: { free: amt }} = (await sdk.api.query.system.account.at(blockHash, ACCOUNT_ID)) as AccountInfo;
  console.log(`Balance fetched from #${blockNumber} [${blockHash}]`);
  return amt;
}

findChangeInBalance();