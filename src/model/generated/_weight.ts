import assert from "assert"
import * as marshal from "./marshal"

export class Weight {
  private _assetId!: string
  private _len!: string

  constructor(props?: Partial<Omit<Weight, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._assetId = marshal.string.fromJSON(json.assetId)
      this._len = marshal.string.fromJSON(json.len)
    }
  }

  get assetId(): string {
    assert(this._assetId != null, 'uninitialized access')
    return this._assetId
  }

  set assetId(value: string) {
    this._assetId = value
  }

  get len(): string {
    assert(this._len != null, 'uninitialized access')
    return this._len
  }

  set len(value: string) {
    this._len = value
  }

  toJSON(): object {
    return {
      assetId: this.assetId,
      len: this.len,
    }
  }
}
