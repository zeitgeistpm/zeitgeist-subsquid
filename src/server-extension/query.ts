import { Asset } from './resolvers/marketStatsWithOrder';
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

export const balanceInfo = (accountId: string, assetId: string, conditions: string) => `
  SELECT
    asset_id,
    SUM(d_balance) AS balance
  FROM
    historical_account_balance
  WHERE
    account_id = '${accountId}'
    AND asset_id LIKE '%${assetId}%'
    ${conditions}
  GROUP BY
    asset_id;
`;

export const marketParticipants = (ids: number[]) => `
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
  WITH
  t0 AS (
    SELECT id, market_id, pool_id, neo_pool_id
    FROM market
    WHERE market_id IN (${ids})
  ),
  t1 AS (
    SELECT t0.market_id, COALESCE(ROUND(SUM(COALESCE(a.price,1) * ab.balance), 0), 0) AS liquidity
    FROM t0
    LEFT JOIN pool p ON p.id = t0.pool_id
    LEFT JOIN account_balance ab ON ab.account_id = p.account_id
    LEFT JOIN asset a ON a.market_id = t0.id AND a.asset_id = ab.asset_id
    WHERE p.id IS NOT NULL
    GROUP BY t0.market_id
  ),
  t2 AS (
    SELECT t0.market_id, COALESCE(ROUND(SUM(a.price * ab.balance), 0), 0) AS liquidity
    FROM t0
    LEFT JOIN neo_pool np ON np.id = t0.neo_pool_id
    LEFT JOIN account_balance ab ON ab.account_id = np.account_id
    LEFT JOIN asset a ON a.market_id = t0.id AND a.asset_id = ab.asset_id
    WHERE np.id IS NOT NULL AND a.asset_id ILIKE '%OUTCOME%'
    GROUP BY t0.market_id
  ),
  t3 AS (
    SELECT t0.market_id, 0 AS liquidity
    FROM t0
    WHERE t0.pool_id IS NULL AND t0.neo_pool_id IS NULL
  ),
  t4 AS (
    SELECT * FROM t1 UNION SELECT * FROM t2 UNION SELECT * FROM t3
  )
  SELECT * FROM t4;
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
    m.market_id = ${marketId}
    AND hm.event ~ '(Pool|Resolved)'
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

export const marketStatsWithOrder = (
  where: string,
  orderBy: string,
  limit: number,
  offset: number,
  prices: Map<Asset, number>
) => `
  SELECT
    m.market_id,
    COALESCE(ROUND(SUM(COALESCE(a.price,1) * ab.balance), 0), 0) AS liquidity,
    COALESCE(COUNT(DISTINCT ha.account_id), 0) AS participants,
    CASE
      WHEN p.base_asset = 'Ztg' THEN COALESCE(ROUND(p.volume * ${prices.get(Asset.Zeitgeist)}, 0), 0)
      ELSE COALESCE(ROUND(p.volume * ${prices.get(Asset.Polkadot)}, 0), 0)
    END AS volume
  FROM
    market m
  LEFT JOIN
    pool p ON p.id = m.pool_id
  LEFT JOIN
    account_balance ab ON ab.account_id = p.account_id
  LEFT JOIN
    asset a ON a.pool_id = p.id AND a.asset_id = ab.asset_id
  LEFT JOIN
    historical_asset ha ON ha.asset_id = a.asset_id
  ${where}
  GROUP BY
    m.market_id,
    p.base_asset,
    p.volume
  ORDER BY 
    ${orderBy}
  LIMIT 
    ${limit}
  OFFSET 
    ${offset};
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
