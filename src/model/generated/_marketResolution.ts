import assert from "assert"
import * as marshal from "./marshal"

/**
 * Market's resolution details
 */
export class MarketResolution {
  private _at!: Date
  private _outcome!: string

  constructor(props?: Partial<Omit<MarketResolution, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._at = marshal.datetime.fromJSON(json.at)
      this._outcome = marshal.string.fromJSON(json.outcome)
    }
  }

  /**
   * Timestamp of resolution
   */
  get at(): Date {
    assert(this._at != null, 'uninitialized access')
    return this._at
  }

  set at(value: Date) {
    this._at = value
  }

  /**
   * Resolved outcome for the market
   */
  get outcome(): string {
    assert(this._outcome != null, 'uninitialized access')
    return this._outcome
  }

  set outcome(value: string) {
    this._outcome = value
  }

  toJSON(): object {
    return {
      at: marshal.datetime.toJSON(this.at),
      outcome: this.outcome,
    }
  }
}
