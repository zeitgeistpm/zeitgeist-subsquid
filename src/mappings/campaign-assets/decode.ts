import * as ss58 from '@subsquid/ss58';
import { events } from '../../types';
import { _Asset } from '../../consts';
import { formatAssetId } from '../../helper';
import { Event } from '../../processor';

export const issued = (event: Event): CampaignAssetsIssued => {
  let decoded: {
    assetId: bigint;
    owner: string;
    amount: bigint;
  };
  if (events.campaignAssets.issued.v54.is(event)) {
    decoded = events.campaignAssets.issued.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    assetId: formatAssetId({ __kind: _Asset.CampaignAsset, value: BigInt(decoded.assetId) }),
    owner: ss58.encode({ prefix: 73, bytes: decoded.owner }),
    amount: BigInt(decoded.amount),
  };
};

export const transferred = (event: Event): CampaignAssetsTransferred => {
  let decoded: {
    assetId: bigint;
    from: string;
    to: string;
    amount: bigint;
  };
  if (events.campaignAssets.transferred.v54.is(event)) {
    decoded = events.campaignAssets.transferred.v54.decode(event);
  } else {
    decoded = event.args;
  }
  return {
    assetId: formatAssetId({ __kind: _Asset.CampaignAsset, value: BigInt(decoded.assetId) }),
    from: ss58.encode({ prefix: 73, bytes: decoded.from }),
    to: ss58.encode({ prefix: 73, bytes: decoded.to }),
    amount: BigInt(decoded.amount),
  };
};

interface CampaignAssetsIssued {
  assetId: string;
  owner: string;
  amount: bigint;
}

interface CampaignAssetsTransferred {
  assetId: string;
  from: string;
  to: string;
  amount: bigint;
}
