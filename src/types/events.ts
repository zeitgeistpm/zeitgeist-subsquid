import assert from 'assert'
import {Chain, ChainContext, EventContext, Event, Result} from './support'
import * as v23 from './v23'
import * as v29 from './v29'
import * as v32 from './v32'
import * as v34 from './v34'
import * as v35 from './v35'
import * as v36 from './v36'
import * as v37 from './v37'
import * as v38 from './v38'
import * as v39 from './v39'

export class BalancesBalanceSetEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Balances.BalanceSet')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A balance was set by root. \[who, free, reserved\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Balances.BalanceSet') === '0f263bfdefa394edfb38d20d33662423a2e0902235b599f9b2b0292f157f0902'
  }

  /**
   *  A balance was set by root. \[who, free, reserved\]
   */
  get asV23(): [Uint8Array, bigint, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A balance was set by root.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Balances.BalanceSet') === '1e2b5d5a07046e6d6e5507661d3f3feaddfb41fc609a2336b24957322080ca77'
  }

  /**
   * A balance was set by root.
   */
  get asV34(): {who: Uint8Array, free: bigint, reserved: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class BalancesDustLostEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Balances.DustLost')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  An account was removed whose balance was non-zero but below ExistentialDeposit,
   *  resulting in an outright loss. \[account, balance\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Balances.DustLost') === '23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4'
  }

  /**
   *  An account was removed whose balance was non-zero but below ExistentialDeposit,
   *  resulting in an outright loss. \[account, balance\]
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An account was removed whose balance was non-zero but below ExistentialDeposit,
   * resulting in an outright loss.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Balances.DustLost') === '504f155afb2789c50df19d1f747fb2dc0e99bf8b7623c30bdb5cf82029fec760'
  }

  /**
   * An account was removed whose balance was non-zero but below ExistentialDeposit,
   * resulting in an outright loss.
   */
  get asV34(): {account: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class BalancesEndowedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Balances.Endowed')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  An account was created with some free balance. \[account, free_balance\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Balances.Endowed') === '23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4'
  }

  /**
   *  An account was created with some free balance. \[account, free_balance\]
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An account was created with some free balance.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Balances.Endowed') === '75951f685df19cbb5fdda09cf928a105518ceca9576d95bd18d4fac8802730ca'
  }

  /**
   * An account was created with some free balance.
   */
  get asV34(): {account: Uint8Array, freeBalance: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class BalancesReservedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Balances.Reserved')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  Some balance was reserved (moved from free to reserved). \[who, value\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Balances.Reserved') === '23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4'
  }

  /**
   *  Some balance was reserved (moved from free to reserved). \[who, value\]
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Some balance was reserved (moved from free to reserved).
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Balances.Reserved') === 'e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5'
  }

  /**
   * Some balance was reserved (moved from free to reserved).
   */
  get asV34(): {who: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class BalancesTransferEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Balances.Transfer')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  Transfer succeeded. \[from, to, value\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Balances.Transfer') === 'dad2bcdca357505fa3c7832085d0db53ce6f902bd9f5b52823ee8791d351872c'
  }

  /**
   *  Transfer succeeded. \[from, to, value\]
   */
  get asV23(): [Uint8Array, Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Transfer succeeded.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Balances.Transfer') === '0ffdf35c495114c2d42a8bf6c241483fd5334ca0198662e14480ad040f1e3a66'
  }

  /**
   * Transfer succeeded.
   */
  get asV34(): {from: Uint8Array, to: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class BalancesUnreservedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Balances.Unreserved')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  Some balance was unreserved (moved from reserved to free). \[who, value\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Balances.Unreserved') === '23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4'
  }

  /**
   *  Some balance was unreserved (moved from reserved to free). \[who, value\]
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Some balance was unreserved (moved from reserved to free).
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Balances.Unreserved') === 'e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5'
  }

  /**
   * Some balance was unreserved (moved from reserved to free).
   */
  get asV34(): {who: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class BalancesWithdrawEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Balances.Withdraw')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees). \[who, value\]
   */
  get isV33(): boolean {
    return this._chain.getEventHash('Balances.Withdraw') === '23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4'
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees). \[who, value\]
   */
  get asV33(): [Uint8Array, bigint] {
    assert(this.isV33)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees).
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Balances.Withdraw') === 'e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5'
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees).
   */
  get asV34(): {who: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class CurrencyDepositedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Currency.Deposited')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  Deposit success. \[currency_id, who, amount\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Currency.Deposited') === '6a3d7e7accde03ae3a0153b6dc5d6cc04eea87393610da84950bbe601ce449cc'
  }

  /**
   *  Deposit success. \[currency_id, who, amount\]
   */
  get asV23(): [v23.Currency, Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Deposit success. \[currency_id, who, amount\]
   */
  get isV32(): boolean {
    return this._chain.getEventHash('Currency.Deposited') === 'df0511d0e921e296dbd5c8b43cb7d8933820cb906e355c768e8407ca9193138f'
  }

  /**
   * Deposit success. \[currency_id, who, amount\]
   */
  get asV32(): [v32.Asset, Uint8Array, bigint] {
    assert(this.isV32)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Deposit success.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Currency.Deposited') === 'a4f1c201945cdbe991182662e3e9964553c56bb38739bf247036896397e7d07d'
  }

  /**
   * Deposit success.
   */
  get asV34(): {currencyId: v34.Asset, who: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class CurrencyTransferredEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Currency.Transferred')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  Currency transfer success. \[currency_id, from, to, amount\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Currency.Transferred') === 'd4ffed7d43664acfa5fe9f6825f538d93e8447c873d770deb40246b11895e2ab'
  }

  /**
   *  Currency transfer success. \[currency_id, from, to, amount\]
   */
  get asV23(): [v23.Currency, Uint8Array, Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Currency transfer success. \[currency_id, from, to, amount\]
   */
  get isV32(): boolean {
    return this._chain.getEventHash('Currency.Transferred') === '3eb8c7c7a28e521728d456307ad372e814aeb4fb200f4be58a00098f9f61c8de'
  }

  /**
   * Currency transfer success. \[currency_id, from, to, amount\]
   */
  get asV32(): [v32.Asset, Uint8Array, Uint8Array, bigint] {
    assert(this.isV32)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Currency transfer success.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Currency.Transferred') === 'ad3d65a0944e3402fd00687198797c37e7b3335997a6f2143cf8893f4d007b35'
  }

  /**
   * Currency transfer success.
   */
  get asV34(): {currencyId: v34.Asset, from: Uint8Array, to: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class CurrencyWithdrawnEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Currency.Withdrawn')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  Withdraw success. \[currency_id, who, amount\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Currency.Withdrawn') === '6a3d7e7accde03ae3a0153b6dc5d6cc04eea87393610da84950bbe601ce449cc'
  }

  /**
   *  Withdraw success. \[currency_id, who, amount\]
   */
  get asV23(): [v23.Currency, Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Withdraw success. \[currency_id, who, amount\]
   */
  get isV32(): boolean {
    return this._chain.getEventHash('Currency.Withdrawn') === 'df0511d0e921e296dbd5c8b43cb7d8933820cb906e355c768e8407ca9193138f'
  }

  /**
   * Withdraw success. \[currency_id, who, amount\]
   */
  get asV32(): [v32.Asset, Uint8Array, bigint] {
    assert(this.isV32)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Withdraw success.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Currency.Withdrawn') === 'a4f1c201945cdbe991182662e3e9964553c56bb38739bf247036896397e7d07d'
  }

  /**
   * Withdraw success.
   */
  get asV34(): {currencyId: v34.Asset, who: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class ParachainStakingRewardedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'ParachainStaking.Rewarded')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  Paid the account (nominator or collator) the balance as liquid rewards
   */
  get isV23(): boolean {
    return this._chain.getEventHash('ParachainStaking.Rewarded') === '23bebce4ca9ed37548947d07d4dc50e772f07401b9a416b6aa2f3e9cb5adcaf4'
  }

  /**
   *  Paid the account (nominator or collator) the balance as liquid rewards
   */
  get asV23(): [Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * Paid the account (delegator or collator) the balance as liquid rewards.
   */
  get isV35(): boolean {
    return this._chain.getEventHash('ParachainStaking.Rewarded') === '1a005a96fdd51900b5609e011c697b2588490316080f642724ed18b187dfc5e5'
  }

  /**
   * Paid the account (delegator or collator) the balance as liquid rewards.
   */
  get asV35(): {account: Uint8Array, rewards: bigint} {
    assert(this.isV35)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsBoughtCompleteSetEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.BoughtCompleteSet')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A complete set of shares has been bought \[market_id, buyer\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.BoughtCompleteSet') === '06f429abb9e0113523a2523f8db0c3bd34b068fa2de515a51d3e616b00bcdf96'
  }

  /**
   *  A complete set of shares has been bought \[market_id, buyer\]
   */
  get asV23(): [bigint, Uint8Array] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A complete set of assets has been bought \[market_id, amount_per_asset, buyer\]
   */
  get isV34(): boolean {
    return this._chain.getEventHash('PredictionMarkets.BoughtCompleteSet') === '2e6ae450e029f130403b99833c1e86f99f3c7ee392e24aee194962aae282097b'
  }

  /**
   * A complete set of assets has been bought \[market_id, amount_per_asset, buyer\]
   */
  get asV34(): [bigint, bigint, Uint8Array] {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketApprovedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketApproved')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A market has been approved \[market_id\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketApproved') === '47b59f698451e50cce59979f0121e842fa3f8b2bcef2e388222dbd69849514f9'
  }

  /**
   *  A market has been approved \[market_id\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   *  A market has been approved \[market_id, new_market_status\]
   */
  get isV29(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketApproved') === 'fb75141ba1d5569f28a5c37f474643ded3eff690fd78829c343a0a124058d613'
  }

  /**
   *  A market has been approved \[market_id, new_market_status\]
   */
  get asV29(): [bigint, v29.MarketStatus] {
    assert(this.isV29)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketClosedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketClosed')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * A market has been closed \[market_id\]
   */
  get isV37(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketClosed') === '47b59f698451e50cce59979f0121e842fa3f8b2bcef2e388222dbd69849514f9'
  }

  /**
   * A market has been closed \[market_id\]
   */
  get asV37(): bigint {
    assert(this.isV37)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketCreatedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketCreated')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A market has been created \[market_id, creator\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketCreated') === 'd5835dbc0b5506d262ae8a5cba6bb055662b6ce13e8654c481788dc3ccb99f88'
  }

  /**
   *  A market has been created \[market_id, creator\]
   */
  get asV23(): [bigint, v23.Market, Uint8Array] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   *  A market has been created \[market_id, creator\]
   */
  get isV29(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketCreated') === '2c071f32da446b7fae945023e2dd3037c4de39decadd715e39fa2083698bec9d'
  }

  /**
   *  A market has been created \[market_id, creator\]
   */
  get asV29(): [bigint, v29.Market] {
    assert(this.isV29)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A market has been created \[market_id, creator\]
   */
  get isV32(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketCreated') === '6ca81d4e3886a4c3588554446139248d28ee3bde379a943e1e37ed34f600fb06'
  }

  /**
   * A market has been created \[market_id, creator\]
   */
  get asV32(): [bigint, v32.Market] {
    assert(this.isV32)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A market has been created \[market_id, market_account, creator\]
   */
  get isV36(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketCreated') === 'b04e51d4c45b55e4412e9baf77f21cf64f9ec4053537e9e2f6905deef91f547c'
  }

  /**
   * A market has been created \[market_id, market_account, creator\]
   */
  get asV36(): [bigint, Uint8Array, v36.Market] {
    assert(this.isV36)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A market has been created \[market_id, market_account, creator\]
   */
  get isV38(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketCreated') === '90ab12cfdc72a6c4a4a4a06f3b17cde83716fef857428b4fe7bf7ddbfa4b9902'
  }

  /**
   * A market has been created \[market_id, market_account, creator\]
   */
  get asV38(): [bigint, Uint8Array, v38.Market] {
    assert(this.isV38)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketDisputedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketDisputed')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A market has been disputed \[market_id, new_outcome\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketDisputed') === '007a7aeacfb1970acc618b491215deef769e6d3d9449f9eb59a07c1dee60c764'
  }

  /**
   *  A market has been disputed \[market_id, new_outcome\]
   */
  get asV23(): [bigint, v23.OutcomeReport] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   *  A market has been disputed \[market_id, new_market_status, new_outcome\]
   */
  get isV29(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketDisputed') === 'fd0dc28edb313bddf194e91060b1a24754d595e9b65696cbacef1fff728b33a8'
  }

  /**
   *  A market has been disputed \[market_id, new_market_status, new_outcome\]
   */
  get asV29(): [bigint, v29.MarketStatus, v29.MarketDispute] {
    assert(this.isV29)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketExpiredEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketExpired')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * An advised market has ended before it was approved or rejected. \[market_id\]
   */
  get isV37(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketExpired') === '47b59f698451e50cce59979f0121e842fa3f8b2bcef2e388222dbd69849514f9'
  }

  /**
   * An advised market has ended before it was approved or rejected. \[market_id\]
   */
  get asV37(): bigint {
    assert(this.isV37)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketInsufficientSubsidyEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketInsufficientSubsidy')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * A market was discarded after failing to gather enough subsidy. \[market_id\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketInsufficientSubsidy') === '47b59f698451e50cce59979f0121e842fa3f8b2bcef2e388222dbd69849514f9'
  }

  /**
   * A market was discarded after failing to gather enough subsidy. \[market_id\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   *  A market was discarded after failing to gather enough subsidy. \[market_id, new_market_status\]
   */
  get isV29(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketInsufficientSubsidy') === 'fb75141ba1d5569f28a5c37f474643ded3eff690fd78829c343a0a124058d613'
  }

  /**
   *  A market was discarded after failing to gather enough subsidy. \[market_id, new_market_status\]
   */
  get asV29(): [bigint, v29.MarketStatus] {
    assert(this.isV29)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketRejectedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketRejected')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  NOTE: Maybe we should only allow rejections.
   *  A pending market has been rejected as invalid. \[market_id\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketRejected') === '47b59f698451e50cce59979f0121e842fa3f8b2bcef2e388222dbd69849514f9'
  }

  /**
   *  NOTE: Maybe we should only allow rejections.
   *  A pending market has been rejected as invalid. \[market_id\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketReportedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketReported')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A market has been reported on \[market_id, reported_outcome\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketReported') === '007a7aeacfb1970acc618b491215deef769e6d3d9449f9eb59a07c1dee60c764'
  }

  /**
   *  A market has been reported on \[market_id, reported_outcome\]
   */
  get asV23(): [bigint, v23.OutcomeReport] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   *  A market has been reported on \[market_id, new_market_status, reported_outcome\]
   */
  get isV29(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketReported') === 'fd0dc28edb313bddf194e91060b1a24754d595e9b65696cbacef1fff728b33a8'
  }

  /**
   *  A market has been reported on \[market_id, new_market_status, reported_outcome\]
   */
  get asV29(): [bigint, v29.MarketStatus, v29.Report] {
    assert(this.isV29)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketResolvedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketResolved')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A market has been resolved \[market_id, real_outcome\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketResolved') === 'a09565b86d3bb325629fe7a6753d0f511a81a98727e87e6650d956e944c56e2e'
  }

  /**
   *  A market has been resolved \[market_id, real_outcome\]
   */
  get asV23(): [bigint, number] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   *  A market has been resolved \[market_id, new_market_status, real_outcome\]
   */
  get isV29(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketResolved') === '4d49ef955924f296709f49e497691ae82c53c1fbb6d0e139806da798e3ad857d'
  }

  /**
   *  A market has been resolved \[market_id, new_market_status, real_outcome\]
   */
  get asV29(): [bigint, v29.MarketStatus, v29.OutcomeReport] {
    assert(this.isV29)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsMarketStartedWithSubsidyEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.MarketStartedWithSubsidy')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A market was started after gathering enough subsidy. \[market_id\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketStartedWithSubsidy') === '47b59f698451e50cce59979f0121e842fa3f8b2bcef2e388222dbd69849514f9'
  }

  /**
   *  A market was started after gathering enough subsidy. \[market_id\]
   */
  get asV23(): bigint {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   *  A market was started after gathering enough subsidy. \[market_id, new_market_status\]
   */
  get isV29(): boolean {
    return this._chain.getEventHash('PredictionMarkets.MarketStartedWithSubsidy') === 'fb75141ba1d5569f28a5c37f474643ded3eff690fd78829c343a0a124058d613'
  }

  /**
   *  A market was started after gathering enough subsidy. \[market_id, new_market_status\]
   */
  get asV29(): [bigint, v29.MarketStatus] {
    assert(this.isV29)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsSoldCompleteSetEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.SoldCompleteSet')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A complete set of shares has been sold \[market_id, seller\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('PredictionMarkets.SoldCompleteSet') === '06f429abb9e0113523a2523f8db0c3bd34b068fa2de515a51d3e616b00bcdf96'
  }

  /**
   *  A complete set of shares has been sold \[market_id, seller\]
   */
  get asV23(): [bigint, Uint8Array] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A complete set of assets has been sold \[market_id, amount_per_asset, seller\]
   */
  get isV34(): boolean {
    return this._chain.getEventHash('PredictionMarkets.SoldCompleteSet') === '2e6ae450e029f130403b99833c1e86f99f3c7ee392e24aee194962aae282097b'
  }

  /**
   * A complete set of assets has been sold \[market_id, amount_per_asset, seller\]
   */
  get asV34(): [bigint, bigint, Uint8Array] {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class PredictionMarketsTokensRedeemedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'PredictionMarkets.TokensRedeemed')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   * An amount of winning outcomes have been redeemed \[market_id, currency_id, amount_redeemed, payout, who\]
   */
  get isV35(): boolean {
    return this._chain.getEventHash('PredictionMarkets.TokensRedeemed') === '2b9c381eb8a00d519422605423f387c0b8e976dda3c557fcc65137951d9bcb1d'
  }

  /**
   * An amount of winning outcomes have been redeemed \[market_id, currency_id, amount_redeemed, payout, who\]
   */
  get asV35(): [bigint, v35.Asset, bigint, bigint, Uint8Array] {
    assert(this.isV35)
    return this._chain.decodeEvent(this.event)
  }
}

export class SwapsPoolCreateEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Swaps.PoolCreate')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A new pool has been created. \[CommonPoolEventParams, pool\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Swaps.PoolCreate') === '639f38bdf67fe503f5b3383a8f7f82052830b8b21210fa56fb6ac93afbb1d455'
  }

  /**
   *  A new pool has been created. \[CommonPoolEventParams, pool\]
   */
  get asV23(): [v23.CommonPoolEventParams, v23.Pool] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool\]
   */
  get isV32(): boolean {
    return this._chain.getEventHash('Swaps.PoolCreate') === '6588e8c5065c2d9dec523e1da61f53572a975e3a30964e7187048972fb7ad11f'
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool\]
   */
  get asV32(): [v32.CommonPoolEventParams, v32.Pool] {
    assert(this.isV32)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount\]
   */
  get isV35(): boolean {
    return this._chain.getEventHash('Swaps.PoolCreate') === '23302b09e5e7dac54ebbe8f35f527876cd9c205144943b678954c0b45ddd7287'
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount\]
   */
  get asV35(): [v35.CommonPoolEventParams, v35.Pool, bigint] {
    assert(this.isV35)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
   */
  get isV36(): boolean {
    return this._chain.getEventHash('Swaps.PoolCreate') === '5e8abe682013e886690b6d2682906d85de56ea805ba61acd0454659f27833bb4'
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
   */
  get asV36(): [v36.CommonPoolEventParams, v36.Pool, bigint, Uint8Array] {
    assert(this.isV36)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
   */
  get isV37(): boolean {
    return this._chain.getEventHash('Swaps.PoolCreate') === '1d7e591f8b1c80fefa10f4c36c3af6a9adbdfb74f72ef5e302dcffada8c0890d'
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
   */
  get asV37(): [v37.CommonPoolEventParams, v37.Pool, bigint, Uint8Array] {
    assert(this.isV37)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
   */
  get isV39(): boolean {
    return this._chain.getEventHash('Swaps.PoolCreate') === '2bb33e103ee138cb6c76a958ffe3367ebe1e30bffd2e07956e215ccb4dde6cb1'
  }

  /**
   * A new pool has been created. \[CommonPoolEventParams, pool, pool_amount, pool_account\]
   */
  get asV39(): [v39.CommonPoolEventParams, v39.Pool, bigint, Uint8Array] {
    assert(this.isV39)
    return this._chain.decodeEvent(this.event)
  }
}

export class SystemExtrinsicFailedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'System.ExtrinsicFailed')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  An extrinsic failed. \[error, info\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('System.ExtrinsicFailed') === '8f2e90e6aab8eb714300f529bf2c1959ca0fa57534b7afcfe92932be302ba337'
  }

  /**
   *  An extrinsic failed. \[error, info\]
   */
  get asV23(): [v23.DispatchError, v23.DispatchInfo] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An extrinsic failed. \[error, info\]
   */
  get isV32(): boolean {
    return this._chain.getEventHash('System.ExtrinsicFailed') === '0995776ff5e8d5f8662a6841d8556c830acc58fbb01f76a13b6aa4222b987150'
  }

  /**
   * An extrinsic failed. \[error, info\]
   */
  get asV32(): [v32.DispatchError, v32.DispatchInfo] {
    assert(this.isV32)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An extrinsic failed.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('System.ExtrinsicFailed') === '2dcccc93ed3f24e5499fe9480fe0a61a806d25bb5fc0d10a1074e360693768e7'
  }

  /**
   * An extrinsic failed.
   */
  get asV34(): {dispatchError: v34.DispatchError, dispatchInfo: v34.DispatchInfo} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An extrinsic failed.
   */
  get isV35(): boolean {
    return this._chain.getEventHash('System.ExtrinsicFailed') === '3b8e9f2b48f4b6f0f996d20434018cdbe20aacb2470e779d965d42dad18b0a4e'
  }

  /**
   * An extrinsic failed.
   */
  get asV35(): {dispatchError: v35.DispatchError, dispatchInfo: v35.DispatchInfo} {
    assert(this.isV35)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An extrinsic failed.
   */
  get isV36(): boolean {
    return this._chain.getEventHash('System.ExtrinsicFailed') === 'a6220584fa4f22cb02db1bfad4eacf1a689aea2324f22b4763def7376b7dd9bf'
  }

  /**
   * An extrinsic failed.
   */
  get asV36(): {dispatchError: v36.DispatchError, dispatchInfo: v36.DispatchInfo} {
    assert(this.isV36)
    return this._chain.decodeEvent(this.event)
  }
}

export class SystemExtrinsicSuccessEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'System.ExtrinsicSuccess')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  An extrinsic completed successfully. \[info\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('System.ExtrinsicSuccess') === '00a75e03130fe6755b02b23ca285a19efc2bd57964ead02525eedef36cbf1bd4'
  }

  /**
   *  An extrinsic completed successfully. \[info\]
   */
  get asV23(): v23.DispatchInfo {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An extrinsic completed successfully.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('System.ExtrinsicSuccess') === '407ed94c14f243acbe2cdb53df52c37d97bbb5ae550a10a6036bf59677cdd165'
  }

  /**
   * An extrinsic completed successfully.
   */
  get asV34(): {dispatchInfo: v34.DispatchInfo} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class SystemNewAccountEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'System.NewAccount')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  A new \[account\] was created.
   */
  get isV23(): boolean {
    return this._chain.getEventHash('System.NewAccount') === '21ea0c8f2488eafafdea1de92b54cd17d8b1caff525e37616abf0ff93f11531d'
  }

  /**
   *  A new \[account\] was created.
   */
  get asV23(): Uint8Array {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * A new account was created.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('System.NewAccount') === '7fb7672b764b0a4f0c4910fddefec0709628843df7ad0073a97eede13c53ca92'
  }

  /**
   * A new account was created.
   */
  get asV34(): {account: Uint8Array} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}

export class TokensEndowedEvent {
  private readonly _chain: Chain
  private readonly event: Event

  constructor(ctx: EventContext)
  constructor(ctx: ChainContext, event: Event)
  constructor(ctx: EventContext, event?: Event) {
    event = event || ctx.event
    assert(event.name === 'Tokens.Endowed')
    this._chain = ctx._chain
    this.event = event
  }

  /**
   *  An account was created with some free balance. \[currency_id,
   *  account, free_balance\]
   */
  get isV23(): boolean {
    return this._chain.getEventHash('Tokens.Endowed') === '6a3d7e7accde03ae3a0153b6dc5d6cc04eea87393610da84950bbe601ce449cc'
  }

  /**
   *  An account was created with some free balance. \[currency_id,
   *  account, free_balance\]
   */
  get asV23(): [v23.CurrencyId, Uint8Array, bigint] {
    assert(this.isV23)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An account was created with some free balance. \[currency_id,
   * account, free_balance\]
   */
  get isV32(): boolean {
    return this._chain.getEventHash('Tokens.Endowed') === 'df0511d0e921e296dbd5c8b43cb7d8933820cb906e355c768e8407ca9193138f'
  }

  /**
   * An account was created with some free balance. \[currency_id,
   * account, free_balance\]
   */
  get asV32(): [v32.Asset, Uint8Array, bigint] {
    assert(this.isV32)
    return this._chain.decodeEvent(this.event)
  }

  /**
   * An account was created with some free balance.
   */
  get isV34(): boolean {
    return this._chain.getEventHash('Tokens.Endowed') === 'a4f1c201945cdbe991182662e3e9964553c56bb38739bf247036896397e7d07d'
  }

  /**
   * An account was created with some free balance.
   */
  get asV34(): {currencyId: v34.Asset, who: Uint8Array, amount: bigint} {
    assert(this.isV34)
    return this._chain.decodeEvent(this.event)
  }
}
