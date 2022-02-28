import assert from "assert"
import * as marshal from "./marshal"

export class OutcomeReport {
  private _categorical!: number | undefined | null
  private _scalar!: number | undefined | null

  constructor(props?: Partial<Omit<OutcomeReport, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._categorical = json.categorical == null ? undefined : marshal.int.fromJSON(json.categorical)
      this._scalar = json.scalar == null ? undefined : marshal.int.fromJSON(json.scalar)
    }
  }

  get categorical(): number | undefined | null {
    return this._categorical
  }

  set categorical(value: number | undefined | null) {
    this._categorical = value
  }

  get scalar(): number | undefined | null {
    return this._scalar
  }

  set scalar(value: number | undefined | null) {
    this._scalar = value
  }

  toJSON(): object {
    return {
      categorical: this.categorical,
      scalar: this.scalar,
    }
  }
}
