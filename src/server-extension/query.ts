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
    COALESCE(ROUND(SUM(a.price * a.amount_in_pool) + p.base_asset_qty, 0), 0) AS liquidity,
    COALESCE(COUNT(DISTINCT ha.account_id), 0) AS participants,
    CASE
      WHEN p.base_asset = 'Ztg' THEN COALESCE(ROUND(p.volume * ${price[Asset.Zeitgeist]}, 0), 0)
      ELSE COALESCE(ROUND(p.volume * ${price[Asset.Polkadot]}, 0), 0)
    END AS volume
  FROM
    market m
  LEFT JOIN
    asset a ON a.asset_id = ANY (m.outcome_assets)
  LEFT JOIN
    historical_asset ha ON ha.asset_id = ANY (m.outcome_assets)
  LEFT JOIN
    pool p ON p.id = m.pool_id
  WHERE
    m.market_id IN (${ids})
  GROUP BY
    m.market_id,
    p.base_asset,
    p.base_asset_qty,
    p.volume
  ORDER BY 
    ${orderBy}
  LIMIT 
    ${limit}
  OFFSET 
    ${offset};
`;

export const marketInfo = (marketId: number) => `
  SELECT
    hm.timestamp,
    m.outcome_assets
  FROM
    market m
  JOIN
    historical_market hm ON hm.market_id = m.market_id
  WHERE
    m.market_id=${marketId}
    AND hm.event~'(Pool|Resolved)'
  GROUP BY
    m.outcome_assets,
    hm.timestamp;
`;

export const totalLiquidityAndVolume = () => `
  SELECT
    ROUND(SUM(liquidity),0) AS total_liquidity,
    SUM(volume) AS total_volume
  FROM (
    SELECT
      m.market_id,
      SUM(a.price*a.amount_in_pool)+p.base_asset_qty AS liquidity,
      p.volume
    FROM
      market m
    JOIN
      asset a ON a.asset_id = ANY (m.outcome_assets)
    JOIN
      pool p ON p.id = m.pool_id
    GROUP BY
      m.market_id,
      p.base_asset_qty,
      p.volume
  ) AS market_stats;
`;
