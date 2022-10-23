import assert from "assert"
import * as marshal from "./marshal"

/**
 * Deadlines for the market represented in blocks
 */
export class MarketDeadlines {
  private _gracePeriod!: bigint
  private _oracleDuration!: bigint
  private _disputeDuration!: bigint

  constructor(props?: Partial<Omit<MarketDeadlines, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._gracePeriod = marshal.bigint.fromJSON(json.gracePeriod)
      this._oracleDuration = marshal.bigint.fromJSON(json.oracleDuration)
      this._disputeDuration = marshal.bigint.fromJSON(json.disputeDuration)
    }
  }

  get gracePeriod(): bigint {
    assert(this._gracePeriod != null, 'uninitialized access')
    return this._gracePeriod
  }

  set gracePeriod(value: bigint) {
    this._gracePeriod = value
  }

  get oracleDuration(): bigint {
    assert(this._oracleDuration != null, 'uninitialized access')
    return this._oracleDuration
  }

  set oracleDuration(value: bigint) {
    this._oracleDuration = value
  }

  get disputeDuration(): bigint {
    assert(this._disputeDuration != null, 'uninitialized access')
    return this._disputeDuration
  }

  set disputeDuration(value: bigint) {
    this._disputeDuration = value
  }

  toJSON(): object {
    return {
      gracePeriod: marshal.bigint.toJSON(this.gracePeriod),
      oracleDuration: marshal.bigint.toJSON(this.oracleDuration),
      disputeDuration: marshal.bigint.toJSON(this.disputeDuration),
    }
  }
}
