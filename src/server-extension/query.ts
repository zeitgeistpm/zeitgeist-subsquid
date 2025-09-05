import { BaseAsset } from '../consts';
import { encodedAssetId } from './helper';

export const assetPriceHistory = (assetIds: string[], startTime: string, endTime: string, interval: string) => `
  WITH t0 AS (
    SELECT
      GENERATE_SERIES (
        '${startTime}'::TIMESTAMP,
        '${endTime}'::TIMESTAMP,
        '${interval}'::INTERVAL
      ) AS timestamp_t0
  )
  SELECT
    t0.timestamp_t0 AS timestamp,
    ha.asset_id,
    ha.new_price
  FROM
    t0
  CROSS JOIN UNNEST(ARRAY[${assetIds.map(id => `'${id}'`).join(', ')}]) AS asset_list(asset_id)
  LEFT JOIN LATERAL (
    SELECT
      asset_id,
      new_price
    FROM
      historical_asset ha
    WHERE
      ha.asset_id = asset_list.asset_id
      AND ha.timestamp <= t0.timestamp_t0
    ORDER BY
      ha.timestamp DESC
    LIMIT 1
  ) ha ON true
  ORDER BY
    t0.timestamp_t0, asset_list.asset_id;
`;;

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

export const issuanceHistory = (assetId: string) => `
  SELECT
    asset_id,
    date(timestamp),
    SUM(d_balance) AS issuance
  FROM
    historical_account_balance
  WHERE
    asset_id LIKE '%${assetId}%'
  GROUP BY
    asset_id,
    date(timestamp)
  ORDER BY
    date ASC;
`;

export const liquidityHistory = () => `
  SELECT
    date(timestamp),
    SUM(d_liquidity) AS liquidity
  FROM
    historical_market
  GROUP BY
    date(timestamp)
  ORDER BY
    date ASC;
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
    AND hm.event ~ '(Created|Resolved)'
  GROUP BY
    m.outcome_assets,
    hm.timestamp;
`;

export const marketLiquidity = (ids: number[]) => `
  WITH
  t0 AS (
    SELECT id, market_id, pool_id, neo_pool_id
    FROM market
    WHERE market_id IN (${ids})
  ),
  t1 AS (
    SELECT t0.market_id, COALESCE(ROUND(SUM(COALESCE(a.price,1) * a.amount_in_pool), 0), 0) AS liquidity
    FROM t0
    LEFT JOIN pool p ON p.id = t0.pool_id
    LEFT JOIN asset a ON a.market_id = t0.id
    WHERE p.id IS NOT NULL
    GROUP BY t0.market_id
  ),
  t2 AS (
    SELECT t0.market_id, COALESCE(ROUND(SUM(a.price * a.amount_in_pool), 0), 0) AS liquidity
    FROM t0
    LEFT JOIN neo_pool np ON np.id = t0.neo_pool_id
    LEFT JOIN market m ON m.id = t0.id
    LEFT JOIN asset a ON a.market_id = t0.id
    WHERE np.id IS NOT NULL AND a.asset_id = ANY(m.outcome_assets)
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
`;;

export const marketMetadata = (ids: number[]) => `
  SELECT
    m.market_id,
    m.metadata
  FROM
    market m
  WHERE
    m.market_id IN (${ids});
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
    m.market_id IN (${ids})
  GROUP BY
    m.market_id;
`;

export const marketStatsWithOrder = (
  where: string,
  orderBy: string,
  limit: number,
  offset: number,
  prices: Map<BaseAsset, number>
) => `
  SELECT
    m.market_id,
    COALESCE(ROUND(SUM(COALESCE(a.price,1) * a.amount_in_pool), 0), 0) AS liquidity,
    COALESCE(COUNT(DISTINCT ha.account_id), 0) AS participants,
    CASE
      WHEN p.base_asset = 'Ztg' THEN COALESCE(ROUND(p.volume * ${prices.get(BaseAsset.ZTG)}, 0), 0)
      ELSE COALESCE(ROUND(p.volume * ${prices.get(BaseAsset.DOT)}, 0), 0)
    END AS volume
  FROM
    market m
  LEFT JOIN
    pool p ON p.id = m.pool_id
  LEFT JOIN
    asset a ON a.pool_id = p.id
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
`;;

export const marketTraders = (ids: number[]) => `
  SELECT
    m.market_id,
    COALESCE(COUNT(DISTINCT hs.account_id), 0) AS traders
  FROM
    market m
  LEFT JOIN
    historical_swap hs ON
    hs.asset_in = ANY(m.outcome_assets) OR
    hs.asset_out = ANY(m.outcome_assets)
  WHERE
    m.market_id IN (${ids})
  GROUP BY
    m.market_id;
`;

export const marketVolume = (ids: number[], prices: Map<BaseAsset, number>) => `
  SELECT
    market_id,
    CASE
      WHEN base_asset = 'Ztg' THEN ROUND(volume * ${prices.get(BaseAsset.ZTG)}, 0)
      WHEN base_asset = '{\"foreignAsset\":0}' THEN ROUND(volume * ${prices.get(BaseAsset.DOT)}, 0)
      ELSE volume
    END AS volume
  FROM
    market
  WHERE
    market_id IN (${ids});
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

export const totalMintedInCourt = () => `
  SELECT
    SUM(d_balance) AS total_minted_in_court
  FROM
    historical_account_balance
  WHERE
    event ~ 'MintedInCourt';
`;

export const volumeHistory = (prices: Map<BaseAsset, number>) => `
  WITH t0 AS (
    SELECT 
      m.base_asset, 
      SUM(hm.d_volume) AS gross_volume, 
      date(hm.timestamp)
    FROM 
      historical_market hm 
      JOIN market m ON hm.market_id = m.id 
    WHERE 
      hm.d_volume > 0 
    GROUP BY
      m.base_asset, 
      date(hm.timestamp)
  )
  SELECT
    date,
    SUM(
      CASE 
        WHEN base_asset = 'Ztg' THEN ROUND(gross_volume * ${prices.get(BaseAsset.ZTG)}, 0) 
        WHEN base_asset = '{"foreignAsset":0}' THEN ROUND(gross_volume * ${prices.get(BaseAsset.DOT)}, 0) 
        ELSE gross_volume 
      END
    ) AS volume
  FROM
    t0
  GROUP BY 
    date
  ORDER BY
    date ASC;
`;

export const comboPoolAssets = (poolId: number) => `
  SELECT 
    ARRAY(
      SELECT ab.asset_id 
      FROM neo_pool np
      JOIN account_balance ab ON ab.account_id = np.account_id  
      WHERE np.pool_id = ${poolId} 
        AND ab.asset_id NOT LIKE '%Ztg%'
        AND ab.asset_id NOT LIKE '%{"foreignAsset"%'
        AND ab.balance > 0
      ORDER BY ab.asset_id
    ) as outcome_assets
`;

export const poolLiquidity = (poolIds: number[]) => `
  WITH pool_assets AS (
    SELECT 
      np.pool_id,
      ab.asset_id,
      ab.balance
    FROM neo_pool np
    JOIN account_balance ab ON ab.account_id = np.account_id
    WHERE 
      np.pool_id IN (${poolIds.join(',')})
      AND ab.asset_id NOT LIKE '%Ztg%'
      AND ab.asset_id NOT LIKE '%{"foreignAsset"%'
      AND ab.balance > 0
  )
  SELECT 
    pa.pool_id,
    COALESCE(ROUND(SUM(COALESCE(ha.new_price, 1) * pa.balance), 0), 0) AS liquidity
  FROM 
    pool_assets pa
  LEFT JOIN LATERAL (
    SELECT new_price
    FROM historical_asset ha
    WHERE ha.asset_id = pa.asset_id
    ORDER BY ha.timestamp DESC
    LIMIT 1
  ) ha ON true
  GROUP BY 
    pa.pool_id
`;

export const poolParticipants = (poolIds: number[]) => `
  SELECT 
    np.pool_id,
    COALESCE(COUNT(DISTINCT ha.account_id), 0) AS participants
  FROM 
    neo_pool np
  JOIN account_balance ab ON ab.account_id = np.account_id
  LEFT JOIN historical_asset ha ON ha.asset_id = ab.asset_id
  WHERE 
    np.pool_id IN (${poolIds.join(',')})
    AND ab.asset_id NOT LIKE '%Ztg%'
    AND ab.asset_id NOT LIKE '%{"foreignAsset"%'
  GROUP BY 
    np.pool_id
`;

export const poolTraders = (poolIds: number[]) => `
  WITH pool_assets AS (
    SELECT 
      np.pool_id,
      ab.asset_id
    FROM neo_pool np
    JOIN account_balance ab ON ab.account_id = np.account_id
    WHERE 
      np.pool_id IN (${poolIds.join(',')})
      AND ab.asset_id NOT LIKE '%Ztg%'
      AND ab.asset_id NOT LIKE '%{"foreignAsset"%'
      AND ab.balance > 0
  )
  SELECT 
    pa.pool_id,
    COALESCE(COUNT(DISTINCT hs.account_id), 0) AS traders
  FROM 
    pool_assets pa
  LEFT JOIN historical_swap hs ON 
    hs.asset_in = pa.asset_id OR 
    hs.asset_out = pa.asset_id
  GROUP BY 
    pa.pool_id
`;

export const poolVolume = (poolIds: number[], prices: Map<BaseAsset, number>) => `
  WITH pool_assets AS (
    SELECT 
      np.pool_id,
      ab.asset_id,
      np.collateral
    FROM neo_pool np
    JOIN account_balance ab ON ab.account_id = np.account_id
    WHERE 
      np.pool_id IN (${poolIds.join(',')})
      AND ab.asset_id NOT LIKE '%Ztg%'
      AND ab.asset_id NOT LIKE '%{"foreignAsset"%'
      AND ab.balance > 0
  ),
  pool_volumes AS (
    SELECT 
      pa.pool_id,
      pa.collateral,
      COALESCE(SUM(COALESCE(hs.asset_amount_in, 0) + COALESCE(hs.asset_amount_out, 0)), 0) AS raw_volume
    FROM 
      pool_assets pa
    LEFT JOIN historical_swap hs ON 
      hs.asset_in = pa.asset_id OR 
      hs.asset_out = pa.asset_id
    GROUP BY 
      pa.pool_id, pa.collateral
  )
  SELECT 
    pv.pool_id,
    CASE
      WHEN pv.collateral = 'Ztg' THEN COALESCE(ROUND(pv.raw_volume * ${prices.get(BaseAsset.ZTG)}, 0), 0)
      WHEN pv.collateral = '{"foreignAsset":0}' THEN COALESCE(ROUND(pv.raw_volume * ${prices.get(BaseAsset.DOT)}, 0), 0)
      ELSE COALESCE(pv.raw_volume, 0)
    END AS volume
  FROM 
    pool_volumes pv
`;
