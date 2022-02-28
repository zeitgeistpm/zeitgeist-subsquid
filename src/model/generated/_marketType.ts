import assert from "assert"
import * as marshal from "./marshal"

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

  get categorical(): string | undefined | null {
    return this._categorical
  }

  set categorical(value: string | undefined | null) {
    this._categorical = value
  }

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
