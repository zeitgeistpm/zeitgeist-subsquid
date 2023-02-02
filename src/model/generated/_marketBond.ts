import assert from "assert"
import * as marshal from "./marshal"

/**
 * Market's bond details
 */
export class MarketBond {
  private _isSettled!: boolean
  private _value!: bigint
  private _who!: string

  constructor(props?: Partial<Omit<MarketBond, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._isSettled = marshal.boolean.fromJSON(json.isSettled)
      this._value = marshal.bigint.fromJSON(json.value)
      this._who = marshal.string.fromJSON(json.who)
    }
  }

  /**
   * The flag which determines if the bond was already unreserved and/or (partially) slashed
   */
  get isSettled(): boolean {
    assert(this._isSettled != null, 'uninitialized access')
    return this._isSettled
  }

  set isSettled(value: boolean) {
    this._isSettled = value
  }

  /**
   * Amount reserved
   */
  get value(): bigint {
    assert(this._value != null, 'uninitialized access')
    return this._value
  }

  set value(value: bigint) {
    this._value = value
  }

  /**
   * The account that reserved the bond
   */
  get who(): string {
    assert(this._who != null, 'uninitialized access')
    return this._who
  }

  set who(value: string) {
    this._who = value
  }

  toJSON(): object {
    return {
      isSettled: this.isSettled,
      value: marshal.bigint.toJSON(this.value),
      who: this.who,
    }
  }
}
