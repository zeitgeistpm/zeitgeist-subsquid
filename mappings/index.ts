var envPath = require('dotenv').config({ path: `.env` })
if (process.env.NODE_ENV) envPath = require('dotenv').config({ path: `.env.${process.env.NODE_ENV}`})
export const env = envPath.parsed

export * from './balances'
export * from './markets'
export * from './swaps'