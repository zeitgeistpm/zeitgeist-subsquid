import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v23 from './v23'
import * as v29 from './v29'
import * as v32 from './v32'
import * as v33 from './v33'
import * as v34 from './v34'
import * as v35 from './v35'

export class BalancesBalanceSetEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.BalanceSet')
  }

  /**
   *  A balance was set by root. \[who, free, reserved\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('balances.BalanceSet') === '890be9c0740650f86b325a08fc07ecc4c2b4f58212c6edaca87dabdbb64d3db1'
  }

  /**
   *  A balance was set by root. \[who, free, reserved\]
   */
  get asV23(): [Uint8Array, bigint, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A balance was set by root.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('balances.BalanceSet') === '4ab45d6d95726adfeb725535bf55a2406d3b4d8ae14ac9005c7bd7e07ea76fcc'
  }

  /**
   * A balance was set by root.
   */
  get asV34(): {who: v34.AccountId32, free: bigint, reserved: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {who: v34.AccountId32, free: bigint, reserved: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class BalancesDustLostEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.DustLost')
  }

  /**
   *  An account was removed whose balance was non-zero but below ExistentialDeposit,
   *  resulting in an outright loss. \[account, balance\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('balances.DustLost') === 'cc03bf0e885d06ab5165f4598e72250fd3e16bc5ba4dbb099deae1a97e4bef09'
  }

  /**
   *  An account was removed whose balance was non-zero but below ExistentialDeposit,
   *  resulting in an outright loss. \[account, balance\]
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An account was removed whose balance was non-zero but below ExistentialDeposit,
   * resulting in an outright loss.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('balances.DustLost') === '10bbf3b0d3ec83ccf1a23f056e1a60d4f66be59072296b48ebf9172ffcdab3f6'
  }

  /**
   * An account was removed whose balance was non-zero but below ExistentialDeposit,
   * resulting in an outright loss.
   */
  get asV34(): {account: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {account: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class BalancesEndowedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Endowed')
  }

  /**
   *  An account was created with some free balance. \[account, free_balance\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('balances.Endowed') === '1b1c107d9931735af253054e543179401a9ff7b0beaee7fa7aa61319dc40a290'
  }

  /**
   *  An account was created with some free balance. \[account, free_balance\]
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An account was created with some free balance.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('balances.Endowed') === '089e94580955109582764033c0ac689ca378b9d2d399441102b094e72be986e7'
  }

  /**
   * An account was created with some free balance.
   */
  get asV34(): {account: v34.AccountId32, freeBalance: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {account: v34.AccountId32, freeBalance: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class BalancesReservedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Reserved')
  }

  /**
   *  Some balance was reserved (moved from free to reserved). \[who, value\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('balances.Reserved') === 'c595c2f71b423f0c1e0798ad69320278f19e727a480f58f312a585980145cf22'
  }

  /**
   *  Some balance was reserved (moved from free to reserved). \[who, value\]
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Some balance was reserved (moved from free to reserved).
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('balances.Reserved') === 'bc321147cc9b824c85c432ac3c753b1319c9ad37babdd0e09ae0f99aeecc9360'
  }

  /**
   * Some balance was reserved (moved from free to reserved).
   */
  get asV34(): {who: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {who: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class BalancesTransferEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Transfer')
  }

  /**
   *  Transfer succeeded. \[from, to, value\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '9611bd6b933331f197e8fa73bac36184681838292120987fec97092ae037d1c8'
  }

  /**
   *  Transfer succeeded. \[from, to, value\]
   */
  get asV23(): [Uint8Array, Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Transfer succeeded.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '99bc4786247456e0d4a44373efe405e598bfadfac87a7c41b0a82a91296836c1'
  }

  /**
   * Transfer succeeded.
   */
  get asV34(): {from: v34.AccountId32, to: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {from: v34.AccountId32, to: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class BalancesUnreservedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Unreserved')
  }

  /**
   *  Some balance was unreserved (moved from reserved to free). \[who, value\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('balances.Unreserved') === 'ab01310b8e7de989b74305e42be550e888c6563ed4ea284f7c56ae7d79566f8c'
  }

  /**
   *  Some balance was unreserved (moved from reserved to free). \[who, value\]
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Some balance was unreserved (moved from reserved to free).
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('balances.Unreserved') === 'be12b7473ab82e15891b929b20269451c731ffad981836a76ca0aae115b9e9f6'
  }

  /**
   * Some balance was unreserved (moved from reserved to free).
   */
  get asV34(): {who: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {who: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class BalancesWithdrawEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Withdraw')
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees). \[who, value\]
   */
  get isV33(): boolean {
    return this.ctx._chain.getEventHash('balances.Withdraw') === 'c817a046dc9663596372188650f4e0b0897f9149bbc73435595dee84b7a9b049'
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees). \[who, value\]
   */
  get asV33(): [v33.AccountId32, bigint] {
    assert(this.isV33)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees).
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('balances.Withdraw') === '7d47465a5bcac497a2c0e813fe27069aff5d6086a74365c4f40bc0d5332e1356'
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees).
   */
  get asV34(): {who: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {who: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class CurrencyDepositedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'currency.Deposited')
  }

  /**
   *  Deposit success. \[currency_id, who, amount\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('currency.Deposited') === '2ad5d54a3cdc609d0f71f11cff1f3a22b893362f444901cd51aab537c9723110'
  }

  /**
   *  Deposit success. \[currency_id, who, amount\]
   */
  get asV23(): [v23.Asset, Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Deposit success. \[currency_id, who, amount\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('currency.Deposited') === 'd90a8301b8e00a5b4296e4f69693e438222fce9e9d0147264037d8a41a0ddc73'
  }

  /**
   * Deposit success. \[currency_id, who, amount\]
   */
  get asV32(): [v32.Asset, v32.AccountId32, bigint] {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Deposit success.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('currency.Deposited') === '71581e41f83b687ffbc92b77a08e5743dcd1579a433d0f2c018e02b05352dbb6'
  }

  /**
   * Deposit success.
   */
  get asV34(): {currencyId: v34.Asset, who: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {currencyId: v34.Asset, who: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class CurrencyTransferredEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'currency.Transferred')
  }

  /**
   *  Currency transfer success. \[currency_id, from, to, amount\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('currency.Transferred') === '237598fc25f42122f6bbae135a29b2001d75d24219dc92e555b010130f6c724e'
  }

  /**
   *  Currency transfer success. \[currency_id, from, to, amount\]
   */
  get asV23(): [v23.Asset, Uint8Array, Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Currency transfer success. \[currency_id, from, to, amount\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('currency.Transferred') === 'ca3af552ba5141257a384abd5b53177c038a27e34e10002a9ced6ac1fb9ab28b'
  }

  /**
   * Currency transfer success. \[currency_id, from, to, amount\]
   */
  get asV32(): [v32.Asset, v32.AccountId32, v32.AccountId32, bigint] {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Currency transfer success.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('currency.Transferred') === '6cd79b56ede9551a07b417d6f577862ddd41f7215ddf4a7336baa0a89bec27d6'
  }

  /**
   * Currency transfer success.
   */
  get asV34(): {currencyId: v34.Asset, from: v34.AccountId32, to: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {currencyId: v34.Asset, from: v34.AccountId32, to: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class CurrencyWithdrawnEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'currency.Withdrawn')
  }

  /**
   *  Withdraw success. \[currency_id, who, amount\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('currency.Withdrawn') === '480a327ea8f5ae0b5a9dac5500ce812efe2f60ffeba7b009efc21b9a093d980f'
  }

  /**
   *  Withdraw success. \[currency_id, who, amount\]
   */
  get asV23(): [v23.Asset, Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Withdraw success. \[currency_id, who, amount\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('currency.Withdrawn') === '3e7af2ab76006a3c2130725d7ec62540e9240fd163311ab5fb471168aa5a3fd4'
  }

  /**
   * Withdraw success. \[currency_id, who, amount\]
   */
  get asV32(): [v32.Asset, v32.AccountId32, bigint] {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Withdraw success.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('currency.Withdrawn') === 'badbf91e776e5a8f698cc47ebaffff75d383373030b25d704d2b49be86bde77b'
  }

  /**
   * Withdraw success.
   */
  get asV34(): {currencyId: v34.Asset, who: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {currencyId: v34.Asset, who: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}

export class PredictionMarketsBoughtCompleteSetEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.BoughtCompleteSet')
  }

  /**
   *  A complete set of shares has been bought \[market_id, buyer\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.BoughtCompleteSet') === 'e5a17d9efa68e2d73f74d77901a392f65bbedc78010ef24a15248aa16fbd5ad2'
  }

  /**
   *  A complete set of shares has been bought \[market_id, buyer\]
   */
  get asV23(): [bigint, Uint8Array] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A complete set of assets has been bought \[market_id, amount_per_asset, buyer\]
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.BoughtCompleteSet') === '168e95b42b15d7b5ab2fbe53bda60ea2148e92d690013ca1bde7baa8b0efcb86'
  }

  /**
   * A complete set of assets has been bought \[market_id, amount_per_asset, buyer\]
   */
  get asV34(): [bigint, bigint, v34.AccountId32] {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): [bigint, bigint, v34.AccountId32] {
    deprecateLatest()
    return this.asV34
  }
}

export class PredictionMarketsMarketApprovedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketApproved')
  }

  /**
   *  A market has been approved \[market_id\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketApproved') === '2d33b29024f025116d4129b96b88c952c1cb8828671bd6e07b04919d3c75df34'
  }

  /**
   *  A market has been approved \[market_id\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  A market has been approved \[market_id, new_market_status\]
   */
  get isV29(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketApproved') === '771a12cb6c18f742cec223bc6e0af522bde0d1f4d904b530e6ea1451eec3c7f9'
  }

  /**
   *  A market has been approved \[market_id, new_market_status\]
   */
  get asV29(): [bigint, v29.MarketStatus] {
    assert(this.isV29)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV29
  }

  get asLatest(): [bigint, v29.MarketStatus] {
    deprecateLatest()
    return this.asV29
  }
}

export class PredictionMarketsMarketCancelledEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketCancelled')
  }

  /**
   *  A pending market has been cancelled. \[market_id, creator\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketCancelled') === '47f20e4340181ef6a9fa426529a2a2f806c76198b2a3d7b22d1d1c9bc6b82e25'
  }

  /**
   *  A pending market has been cancelled. \[market_id, creator\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV23
  }

  get asLatest(): bigint {
    deprecateLatest()
    return this.asV23
  }
}

export class PredictionMarketsMarketCreatedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketCreated')
  }

  /**
   *  A market has been created \[market_id, creator\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketCreated') === '234c051495a8d1058a867f7009e9136254e29b97ded2664aac0dc784a304455b'
  }

  /**
   *  A market has been created \[market_id, creator\]
   */
  get asV23(): [bigint, v23.Market, Uint8Array] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  A market has been created \[market_id, creator\]
   */
  get isV29(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketCreated') === '9e531fe4e89fb18b0e03d85c47584a056dc09e3f96b9321e93b4031ae6a9b394'
  }

  /**
   *  A market has been created \[market_id, creator\]
   */
  get asV29(): [bigint, v29.Market] {
    assert(this.isV29)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A market has been created \[market_id, creator\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketCreated') === 'fb70323030206a1db87fb88cdb0d405c5add83ae94380ebcce71a80906fca29b'
  }

  /**
   * A market has been created \[market_id, creator\]
   */
  get asV32(): [bigint, v32.Market] {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV32
  }

  get asLatest(): [bigint, v32.Market] {
    deprecateLatest()
    return this.asV32
  }
}

export class PredictionMarketsMarketDisputedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketDisputed')
  }

  /**
   *  A market has been disputed \[market_id, new_outcome\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketDisputed') === '5b43e0aaeac58768083b7801a174ba883d779f9a8ab3306a03e2f831a11112b3'
  }

  /**
   *  A market has been disputed \[market_id, new_outcome\]
   */
  get asV23(): [bigint, v23.OutcomeReport] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  A market has been disputed \[market_id, new_market_status, new_outcome\]
   */
  get isV29(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketDisputed') === '7f1d6e5bbf4c24e25e2834e9ae258693bc69c1df456a6124ebe4f4845ac5bffc'
  }

  /**
   *  A market has been disputed \[market_id, new_market_status, new_outcome\]
   */
  get asV29(): [bigint, v29.MarketStatus, v29.MarketDispute] {
    assert(this.isV29)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV29
  }

  get asLatest(): [bigint, v29.MarketStatus, v29.MarketDispute] {
    deprecateLatest()
    return this.asV29
  }
}

export class PredictionMarketsMarketInsufficientSubsidyEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketInsufficientSubsidy')
  }

  /**
   * A market was discarded after failing to gather enough subsidy. \[market_id\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketInsufficientSubsidy') === '9477f6da762323cb24207f043d357b8b07235daf1e72dcdbcc2aa04d1a84aa51'
  }

  /**
   * A market was discarded after failing to gather enough subsidy. \[market_id\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  A market was discarded after failing to gather enough subsidy. \[market_id, new_market_status\]
   */
  get isV29(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketInsufficientSubsidy') === 'b9a2f8d2ec62cb37dba2d77f1b4036f9318cc6d7fee2b2cfeb7eccc6da1d0e8c'
  }

  /**
   *  A market was discarded after failing to gather enough subsidy. \[market_id, new_market_status\]
   */
  get asV29(): [bigint, v29.MarketStatus] {
    assert(this.isV29)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV29
  }

  get asLatest(): [bigint, v29.MarketStatus] {
    deprecateLatest()
    return this.asV29
  }
}

export class PredictionMarketsMarketRejectedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketRejected')
  }

  /**
   *  NOTE: Maybe we should only allow rejections.
   *  A pending market has been rejected as invalid. \[market_id\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketRejected') === 'cb465c6d66d78f7086a544b25bde2366421b2a263d21e410004f454f88dd62be'
  }

  /**
   *  NOTE: Maybe we should only allow rejections.
   *  A pending market has been rejected as invalid. \[market_id\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV23
  }

  get asLatest(): bigint {
    deprecateLatest()
    return this.asV23
  }
}

export class PredictionMarketsMarketReportedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketReported')
  }

  /**
   *  A market has been reported on \[market_id, reported_outcome\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketReported') === '529bd6fbba26e2a395b61ec195be7f733d2dd311998ef64ab010bbf0fa489070'
  }

  /**
   *  A market has been reported on \[market_id, reported_outcome\]
   */
  get asV23(): [bigint, v23.OutcomeReport] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  A market has been reported on \[market_id, new_market_status, reported_outcome\]
   */
  get isV29(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketReported') === '518ac03652ac432a54207e806e033caf1e214166eb6c04309553b784f7723c14'
  }

  /**
   *  A market has been reported on \[market_id, new_market_status, reported_outcome\]
   */
  get asV29(): [bigint, v29.MarketStatus, v29.Report] {
    assert(this.isV29)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV29
  }

  get asLatest(): [bigint, v29.MarketStatus, v29.Report] {
    deprecateLatest()
    return this.asV29
  }
}

export class PredictionMarketsMarketResolvedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketResolved')
  }

  /**
   *  A market has been resolved \[market_id, real_outcome\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketResolved') === '5604ce5e2874494e43371b046cdf12eec61edd67f632702c5fce7fb140250d1d'
  }

  /**
   *  A market has been resolved \[market_id, real_outcome\]
   */
  get asV23(): [bigint, number] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  A market has been resolved \[market_id, new_market_status, real_outcome\]
   */
  get isV29(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketResolved') === '5271805fa141e2e816532d2ecbceab8340785e853cda6a0624852a2d574bbaa8'
  }

  /**
   *  A market has been resolved \[market_id, new_market_status, real_outcome\]
   */
  get asV29(): [bigint, v29.MarketStatus, v29.OutcomeReport] {
    assert(this.isV29)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV29
  }

  get asLatest(): [bigint, v29.MarketStatus, v29.OutcomeReport] {
    deprecateLatest()
    return this.asV29
  }
}

export class PredictionMarketsMarketStartedWithSubsidyEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.MarketStartedWithSubsidy')
  }

  /**
   *  A market was started after gathering enough subsidy. \[market_id\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketStartedWithSubsidy') === 'c584907c91e7b9a1f5b34549010dd10a85254f1f3d331884f8249d4978e47d36'
  }

  /**
   *  A market was started after gathering enough subsidy. \[market_id\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   *  A market was started after gathering enough subsidy. \[market_id, new_market_status\]
   */
  get isV29(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.MarketStartedWithSubsidy') === 'bbc7b0e026c69f31bbce2ed88cb2cea5f4e8a62d07eaa376a356b98ef96ac8e3'
  }

  /**
   *  A market was started after gathering enough subsidy. \[market_id, new_market_status\]
   */
  get asV29(): [bigint, v29.MarketStatus] {
    assert(this.isV29)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV29
  }

  get asLatest(): [bigint, v29.MarketStatus] {
    deprecateLatest()
    return this.asV29
  }
}

export class PredictionMarketsSoldCompleteSetEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'predictionMarkets.SoldCompleteSet')
  }

  /**
   *  A complete set of shares has been sold \[market_id, seller\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.SoldCompleteSet') === 'fb96f21977f34209de5c43dbc3445fa75102728bcfb0005e56de351b7817f42a'
  }

  /**
   *  A complete set of shares has been sold \[market_id, seller\]
   */
  get asV23(): [bigint, Uint8Array] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A complete set of assets has been sold \[market_id, amount_per_asset, seller\]
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('predictionMarkets.SoldCompleteSet') === '1fa1d0f705231fce5bab988ac4164d3d9c6f4d66c8184d1fed3992e2985bafd6'
  }

  /**
   * A complete set of assets has been sold \[market_id, amount_per_asset, seller\]
   */
  get asV34(): [bigint, bigint, v34.AccountId32] {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): [bigint, bigint, v34.AccountId32] {
    deprecateLatest()
    return this.asV34
  }
}

export class SwapsPoolCreateEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'swaps.PoolCreate')
  }

  /**
   *  A new pool has been created. \[CommonPoolEventParams, pool\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolCreate') === 'd467c71eaacc7317b6794b98a4efae6958ed2d36c7ad157b55cb0c5fb974f49d'
  }

  /**
   *  A new pool has been created. \[CommonPoolEventParams, pool\]
   */
  get asV23(): [v23.CommonPoolEventParams, v23.Pool] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolCreate') === '49f9ee4a56328845e20f5841e1e0dcdd3c91ffb2a29baf4efadd18e97da7efa3'
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool\]
   */
  get asV32(): [v32.CommonPoolEventParams, v32.Pool] {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount\]
   */
  get isV35(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolCreate') === '4062f8bbf839a56111b44d9e9ad9197242fbce2949151e8e34cea7d266355826'
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount\]
   */
  get asV35(): [v35.CommonPoolEventParams, v35.Pool, bigint] {
    assert(this.isV35)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV35
  }

  get asLatest(): [v35.CommonPoolEventParams, v35.Pool, bigint] {
    deprecateLatest()
    return this.asV35
  }
}

export class SwapsPoolExitEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'swaps.PoolExit')
  }

  /**
   *  Someone has exited a pool. \[PoolAssetsEvent\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolExit') === 'ee34510d19fb213d53454b3e907e0f96d9699c96d76717e2537a47e56489257d'
  }

  /**
   *  Someone has exited a pool. \[PoolAssetsEvent\]
   */
  get asV23(): v23.PoolAssetsEvent {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Someone has exited a pool. \[PoolAssetsEvent\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolExit') === 'c7818a793df83c53de57c69e6c008ff3687049c85c0b5e8ec098a259b186825c'
  }

  /**
   * Someone has exited a pool. \[PoolAssetsEvent\]
   */
  get asV32(): v32.PoolAssetsEvent {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Someone has exited a pool. \[PoolAssetsEvent\]
   */
  get isV35(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolExit') === '6415c656af5a84e68b89084a6429f7b2793906993a85b92f6a4ad41c98be2a52'
  }

  /**
   * Someone has exited a pool. \[PoolAssetsEvent\]
   */
  get asV35(): v35.PoolAssetsEvent {
    assert(this.isV35)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV35
  }

  get asLatest(): v35.PoolAssetsEvent {
    deprecateLatest()
    return this.asV35
  }
}

export class SwapsPoolJoinEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'swaps.PoolJoin')
  }

  /**
   *  Someone has joined a pool. \[PoolAssetsEvent\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolJoin') === 'bd899ac0f471bae1187f264c97ea0214fcf8aaee071ba0c99738e3286b98bbe9'
  }

  /**
   *  Someone has joined a pool. \[PoolAssetsEvent\]
   */
  get asV23(): v23.PoolAssetsEvent {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Someone has joined a pool. \[PoolAssetsEvent\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolJoin') === '7b403e9adecd9cada30ffadee24e107e6048f3743c703eed82151cf0cfc2e117'
  }

  /**
   * Someone has joined a pool. \[PoolAssetsEvent\]
   */
  get asV32(): v32.PoolAssetsEvent {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Someone has joined a pool. \[PoolAssetsEvent\]
   */
  get isV35(): boolean {
    return this.ctx._chain.getEventHash('swaps.PoolJoin') === '2b4d42750b19beaee52c5bba5c95f3f382ef359cf642f480ef75df9edf8e05a9'
  }

  /**
   * Someone has joined a pool. \[PoolAssetsEvent\]
   */
  get asV35(): v35.PoolAssetsEvent {
    assert(this.isV35)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV35
  }

  get asLatest(): v35.PoolAssetsEvent {
    deprecateLatest()
    return this.asV35
  }
}

export class SwapsSwapExactAmountInEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'swaps.SwapExactAmountIn')
  }

  /**
   *  An exact amount of an asset is entering the pool. \[SwapEvent\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('swaps.SwapExactAmountIn') === 'b4a7c41fa14ed7c07b215396f75e6725394dd5b9f85bdb551df5e98519161f57'
  }

  /**
   *  An exact amount of an asset is entering the pool. \[SwapEvent\]
   */
  get asV23(): v23.SwapEvent {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An exact amount of an asset is entering the pool. \[SwapEvent\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('swaps.SwapExactAmountIn') === 'ffac7b1174b16ac7139a4bffb5aed61c276a57e6ef1cea8b5af21310faf621e4'
  }

  /**
   * An exact amount of an asset is entering the pool. \[SwapEvent\]
   */
  get asV32(): v32.SwapEvent {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV32
  }

  get asLatest(): v32.SwapEvent {
    deprecateLatest()
    return this.asV32
  }
}

export class SwapsSwapExactAmountOutEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'swaps.SwapExactAmountOut')
  }

  /**
   *  An exact amount of an asset is leaving the pool. \[SwapEvent\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('swaps.SwapExactAmountOut') === '96e915e3fff3482f277ac0fc3b70e9eb99167e4e29cb19183e46d9f0bb2a5691'
  }

  /**
   *  An exact amount of an asset is leaving the pool. \[SwapEvent\]
   */
  get asV23(): v23.SwapEvent {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An exact amount of an asset is leaving the pool. \[SwapEvent\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('swaps.SwapExactAmountOut') === 'a7007057694b49f67c47709bac3317ef275ae764fdd6e4a217c5076e9ee296fc'
  }

  /**
   * An exact amount of an asset is leaving the pool. \[SwapEvent\]
   */
  get asV32(): v32.SwapEvent {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV32
  }

  get asLatest(): v32.SwapEvent {
    deprecateLatest()
    return this.asV32
  }
}

export class SystemExtrinsicFailedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'system.ExtrinsicFailed')
  }

  /**
   *  An extrinsic failed. \[error, info\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('system.ExtrinsicFailed') === 'd15e43ec484da919f52e8c8540c82d49697b1ffd6adbefdea160e0373404c84b'
  }

  /**
   *  An extrinsic failed. \[error, info\]
   */
  get asV23(): [v23.DispatchError, v23.DispatchInfo] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An extrinsic failed. \[error, info\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('system.ExtrinsicFailed') === 'd812bdd15960b4d228ddc9129c7c28ea70e171f8d9ecc7f881255ee7373fe3ce'
  }

  /**
   * An extrinsic failed. \[error, info\]
   */
  get asV32(): [v32.DispatchError, v32.DispatchInfo] {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An extrinsic failed.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('system.ExtrinsicFailed') === '496691f0c811d0944bacbcdfd5e5a9262e7337e070134398577a4631ba259b6d'
  }

  /**
   * An extrinsic failed.
   */
  get asV34(): {dispatchError: v34.DispatchError, dispatchInfo: v34.DispatchInfo} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An extrinsic failed.
   */
  get isV35(): boolean {
    return this.ctx._chain.getEventHash('system.ExtrinsicFailed') === '6ee0abd9a4f0ace52d3227745c8ffaaed4dceadc905c1768133fdf4a912ca14d'
  }

  /**
   * An extrinsic failed.
   */
  get asV35(): {dispatchError: v35.DispatchError, dispatchInfo: v35.DispatchInfo} {
    assert(this.isV35)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV35
  }

  get asLatest(): {dispatchError: v35.DispatchError, dispatchInfo: v35.DispatchInfo} {
    deprecateLatest()
    return this.asV35
  }
}

export class SystemExtrinsicSuccessEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'system.ExtrinsicSuccess')
  }

  /**
   *  An extrinsic completed successfully. \[info\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('system.ExtrinsicSuccess') === '079d1584a2cf6dfba73be476c1fe8b2ad488df77699aecaadf0f384c0132c9b2'
  }

  /**
   *  An extrinsic completed successfully. \[info\]
   */
  get asV23(): v23.DispatchInfo {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An extrinsic completed successfully.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('system.ExtrinsicSuccess') === 'd1518501dcf2f87b09d7fbeefe29eaf7f3d9926323748707ef5582bd589a9e19'
  }

  /**
   * An extrinsic completed successfully.
   */
  get asV34(): {dispatchInfo: v34.DispatchInfo} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {dispatchInfo: v34.DispatchInfo} {
    deprecateLatest()
    return this.asV34
  }
}

export class SystemNewAccountEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'system.NewAccount')
  }

  /**
   *  A new \[account\] was created.
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('system.NewAccount') === '41e6479efbca0bd4626350a011e3350dacbac77599b9e4666568b10dc5b1fc24'
  }

  /**
   *  A new \[account\] was created.
   */
  get asV23(): Uint8Array {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * A new account was created.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('system.NewAccount') === '907b2fa451c8f03a165484ae615c0d34a56c36fbf3d8949aae035cc3054112c1'
  }

  /**
   * A new account was created.
   */
  get asV34(): {account: v34.AccountId32} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {account: v34.AccountId32} {
    deprecateLatest()
    return this.asV34
  }
}

export class TokensEndowedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'tokens.Endowed')
  }

  /**
   *  An account was created with some free balance. \[currency_id,
   *  account, free_balance\]
   */
  get isV23(): boolean {
    return this.ctx._chain.getEventHash('tokens.Endowed') === 'de832fbc949ffc347fb2a70ac21f70434c12a8ef5cce95a064f1169b41b17061'
  }

  /**
   *  An account was created with some free balance. \[currency_id,
   *  account, free_balance\]
   */
  get asV23(): [v23.Asset, Uint8Array, bigint] {
    assert(this.isV23)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An account was created with some free balance. \[currency_id,
   * account, free_balance\]
   */
  get isV32(): boolean {
    return this.ctx._chain.getEventHash('tokens.Endowed') === '03f4f25857d1e439ca822d9e46410cd1750f6836719a087ee70cf242127ba1bf'
  }

  /**
   * An account was created with some free balance. \[currency_id,
   * account, free_balance\]
   */
  get asV32(): [v32.Asset, v32.AccountId32, bigint] {
    assert(this.isV32)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * An account was created with some free balance.
   */
  get isV34(): boolean {
    return this.ctx._chain.getEventHash('tokens.Endowed') === '86247dad7f4c13239394ed124a341be2d45f15730142e1b10ca1157bb6be61e8'
  }

  /**
   * An account was created with some free balance.
   */
  get asV34(): {currencyId: v34.Asset, who: v34.AccountId32, amount: bigint} {
    assert(this.isV34)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV34
  }

  get asLatest(): {currencyId: v34.Asset, who: v34.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV34
  }
}
