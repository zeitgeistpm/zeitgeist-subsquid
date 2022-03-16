import assert from "assert"
import * as marshal from "./marshal"

/**
 * Market's types
 */
export class MarketType {
  private _categorical!: string | undefined | null
  private _scalar!: string | undefined | null

  constructor(props?: Partial<Omit<MarketType, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._categorical = json.categorical == null ? undefined : marshal.string.fromJSON(json.categorical)
      this._scalar = json.scalar == null ? undefined : marshal.string.fromJSON(json.scalar)
    }
  }

  /**
   * Number of categories if categorical market
   */
  get categorical(): string | undefined | null {
    return this._categorical
  }

  set categorical(value: string | undefined | null) {
    this._categorical = value
  }

  /**
   * Range of values if scalar market
   */
  get scalar(): string | undefined | null {
    return this._scalar
  }

  set scalar(value: string | undefined | null) {
    this._scalar = value
  }

  toJSON(): object {
    return {
      categorical: this.categorical,
      scalar: this.scalar,
    }
  }
}
