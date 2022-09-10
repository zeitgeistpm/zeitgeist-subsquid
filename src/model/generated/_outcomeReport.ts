import assert from "assert"
import * as marshal from "./marshal"

/**
 * Market's outcome details
 */
export class OutcomeReport {
  private _categorical!: number | undefined | null
  private _scalar!: bigint | undefined | null

  constructor(props?: Partial<Omit<OutcomeReport, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._categorical = json.categorical == null ? undefined : marshal.int.fromJSON(json.categorical)
      this._scalar = json.scalar == null ? undefined : marshal.bigint.fromJSON(json.scalar)
    }
  }

  /**
   * Index of the categories. Null if market is scalar
   */
  get categorical(): number | undefined | null {
    return this._categorical
  }

  set categorical(value: number | undefined | null) {
    this._categorical = value
  }

  /**
   * Resultant value from the scalar range. Null if market is categorical
   */
  get scalar(): bigint | undefined | null {
    return this._scalar
  }

  set scalar(value: bigint | undefined | null) {
    this._scalar = value
  }

  toJSON(): object {
    return {
      categorical: this.categorical,
      scalar: this.scalar == null ? undefined : marshal.bigint.toJSON(this.scalar),
    }
  }
}
