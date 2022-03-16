import assert from "assert"
import * as marshal from "./marshal"

/**
 * Time period of the market
 */
export class MarketPeriod {
  private _block!: string | undefined | null
  private _timestamp!: string | undefined | null

  constructor(props?: Partial<Omit<MarketPeriod, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._block = json.block == null ? undefined : marshal.string.fromJSON(json.block)
      this._timestamp = json.timestamp == null ? undefined : marshal.string.fromJSON(json.timestamp)
    }
  }

  /**
   * start & end block numbers
   */
  get block(): string | undefined | null {
    return this._block
  }

  set block(value: string | undefined | null) {
    this._block = value
  }

  /**
   * start & end timestamps
   */
  get timestamp(): string | undefined | null {
    return this._timestamp
  }

  set timestamp(value: string | undefined | null) {
    this._timestamp = value
  }

  toJSON(): object {
    return {
      block: this.block,
      timestamp: this.timestamp,
    }
  }
}
