import { encodedAssetId } from './helper';

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

export const marketParticipants = (ids: string[]) => `
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

export const marketLiquidity = (ids: string[]) => `
  SELECT
    m.market_id,
    COALESCE(ROUND(SUM(a.price*a.amount_in_pool)+p.ztg_qty, 0), 0) AS liquidity
  FROM
    market m
  LEFT JOIN
    asset a ON a.asset_id = ANY (m.outcome_assets)
  LEFT JOIN
    pool p ON p.id = m.pool_id
  WHERE
    m.market_id in (${ids})
  GROUP BY
    m.market_id,
    p.ztg_qty;
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
      SUM(a.price*a.amount_in_pool)+p.ztg_qty AS liquidity,
      p.volume
    FROM
      market m
    JOIN
      asset a ON a.asset_id = ANY (m.outcome_assets)
    JOIN
      pool p ON p.id = m.pool_id
    GROUP BY
      m.market_id,
      p.ztg_qty,
      p.volume
  ) AS market_stats;
`;
