import assert from 'assert'
import {Chain, ChainContext, EventContext, Event, Result} from './support'

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
