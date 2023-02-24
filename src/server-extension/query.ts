export const assetPriceHistory = (assetId: string) => `
  SELECT
    DISTINCT ON (timestamp) timestamp,
    new_price as price
  FROM
    historical_asset
  WHERE
    asset_id LIKE '%${assetId}%'
  ORDER BY
    timestamp,
    id DESC;
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
  JOIN
    asset a ON a.asset_id = ANY (m.outcome_assets)
  LEFT JOIN
    pool p ON p.id = m.pool_id
  WHERE
    m.market_id in (${ids})
  GROUP BY
    m.market_id,
    p.ztg_qty;
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
