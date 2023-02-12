export const marketParticipants = (ids: string[]) => `
  SELECT
    m.market_id,
    COALESCE(COUNT(DISTINCT ha.account_id), 0) as participants
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
    COALESCE(ROUND(SUM(a.price*a.amount_in_pool)+p.ztg_qty, 0), 0) as liquidity
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
