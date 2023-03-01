import { encodedAssetId } from './helper';

export const assetPriceHistory = (
  assetId: string,
  poolCreateTime: string,
  startTime: string,
  endTime: string,
  interval: string
) => `
  SELECT
    x.generate_series AS timestamp,
    y.latest_value AS "${encodedAssetId(assetId)}"
  FROM (
    SELECT
      GENERATE_SERIES (
        TIMEZONE('UTC', '${startTime}'::TIMESTAMP),
        TIMEZONE('UTC', '${endTime}'::TIMESTAMP),
        '${interval}'::INTERVAL
      )
  ) x
  LEFT JOIN (
    SELECT
      generate_series,
      FIRST_VALUE(new_price) OVER (PARTITION BY value_partition ORDER BY generate_series) AS latest_value
    FROM (
      SELECT
        *,
        SUM(CASE WHEN new_price IS NULL THEN 0 ELSE 1 END) OVER (ORDER BY generate_series) AS value_partition
      FROM (
        SELECT
          GENERATE_SERIES (
            TIMEZONE('UTC', '${poolCreateTime}'::TIMESTAMP),
            TIMEZONE('UTC', '${endTime}'::TIMESTAMP),
            '10 SECONDS'::INTERVAL
          )
      ) a
      LEFT JOIN (
        SELECT
          DISTINCT ON (timestamp) DATE_TRUNC('SECOND', ha.timestamp::timestamp),
          ha.new_price
        FROM
          historical_asset ha
        WHERE
          ha.asset_id LIKE '%${assetId}%'
        ORDER BY
          ha.timestamp,
          ha.id DESC
      ) b
      ON b.date_trunc = a.generate_series
    ) AS q
  ) y
  ON y.generate_series = x.generate_series;
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
