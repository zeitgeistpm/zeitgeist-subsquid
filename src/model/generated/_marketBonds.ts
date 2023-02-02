import assert from "assert"
import * as marshal from "./marshal"
import {MarketBond} from "./_marketBond"

/**
 * Amount reserved for creation of markets, selecting oracles, joining the council, 
 * making treasury proposals, setting on-chain identities, voting, 
 * creating DAOs, and other parts of the protocol.
 */
export class MarketBonds {
  private _creation!: MarketBond | undefined | null
  private _oracle!: MarketBond | undefined | null

  constructor(props?: Partial<Omit<MarketBonds, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._creation = json.creation == null ? undefined : new MarketBond(undefined, json.creation)
      this._oracle = json.oracle == null ? undefined : new MarketBond(undefined, json.oracle)
    }
  }

  /**
   * Bond associated with creation of markets
   */
  get creation(): MarketBond | undefined | null {
    return this._creation
  }

  set creation(value: MarketBond | undefined | null) {
    this._creation = value
  }

  /**
   * Bond associated with oracle selection
   */
  get oracle(): MarketBond | undefined | null {
    return this._oracle
  }

  set oracle(value: MarketBond | undefined | null) {
    this._oracle = value
  }

  toJSON(): object {
    return {
      creation: this.creation == null ? undefined : this.creation.toJSON(),
      oracle: this.oracle == null ? undefined : this.oracle.toJSON(),
    }
  }
}
