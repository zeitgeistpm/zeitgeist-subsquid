import { encodedAssetId } from './helper';
import { Asset } from './resolvers/marketStats';

export const assetPriceHistory = (assetId: string, startTime: string, endTime: string, interval: string) => `
  WITH t0 AS (
    SELECT
      GENERATE_SERIES (
        '${startTime}'::TIMESTAMP,
        '${endTime}'::TIMESTAMP,
        '${interval}'::INTERVAL
      ) AS timestamp_t0
  )
  SELECT
    timestamp_t0 AS timestamp,
    new_price AS "${encodedAssetId(assetId)}"
  FROM
    t0
  LEFT JOIN LATERAL (
    SELECT
      timestamp,
      new_price
    FROM
      historical_asset
    WHERE
      asset_id LIKE '%${assetId}%'
      AND timestamp <= timestamp_t0
    ORDER BY
      id DESC
    LIMIT 1
  ) a
  ON 1 = 1;
`;

export const balanceInfo = (accountId: string, assetId: string, blockNumber: string) => `
  SELECT
    asset_id,
    SUM(d_balance) AS balance
  FROM
    historical_account_balance
  WHERE
    account_id = '${accountId}'
    AND asset_id LIKE '%${assetId}%'
    AND block_number <= ${blockNumber}
  GROUP BY
    asset_id;
`;

export const marketStats = (ids: string, orderBy: string, limit: number, offset: number, price: any) => `
  SELECT
    m.market_id,
    COALESCE(COUNT(DISTINCT ha.account_id), 0) AS participants
  FROM
    market m
  LEFT JOIN
    historical_asset ha ON ha.asset_id = ANY (m.outcome_assets)
  WHERE
    m.market_id in (${ids})
  GROUP BY
    m.market_id;
`;

export const marketLiquidity = (ids: number[]) => `
  SELECT
    m.market_id,
    COALESCE(ROUND(SUM(COALESCE(a.price,1) * ab.balance), 0), 0) AS liquidity
  FROM
    market m
  LEFT JOIN
    pool p ON p.id = m.pool_id
  LEFT JOIN
    account_balance ab ON ab.account_id = p.account_id
  LEFT JOIN
    asset a ON a.pool_id = p.id AND a.asset_id = ab.asset_id
  WHERE
    m.market_id IN (${ids})
  GROUP BY
    m.market_id;
`;

export const marketInfo = (marketId: number) => `
  SELECT
    hm.timestamp,
    m.outcome_assets
  FROM
    market m
  JOIN
    historical_market hm ON hm.market_id = m.id
  WHERE
    m.market_id=${marketId}
    AND hm.event~'(Pool|Resolved)'
  GROUP BY
    m.outcome_assets,
    hm.timestamp;
`;

export const marketMetadata = (ids: number[]) => `
  SELECT
    m.market_id,
    m.metadata
  FROM
    market m
  WHERE
    m.market_id IN (${ids});
`;

export const totalLiquidityAndVolume = () => `
  SELECT
    ROUND(SUM(liquidity),0) AS total_liquidity,
    SUM(volume) AS total_volume
  FROM (
    SELECT
      m.market_id,
      SUM(a.price*a.amount_in_pool)+ab.balance AS liquidity,
      p.volume
    FROM
      market m
    JOIN
      asset a ON a.asset_id = ANY (m.outcome_assets)
    JOIN
      pool p ON p.id = m.pool_id
    JOIN
      account_balance ab ON ab.account_id = p.account_id
    WHERE
      ab.asset_id NOT LIKE '%Outcome%'
      AND ab.balance > 0
    GROUP BY
      m.market_id,
      ab.balance,
      p.volume
  ) AS market_stats;
`;
