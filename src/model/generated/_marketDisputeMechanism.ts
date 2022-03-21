import assert from "assert"
import * as marshal from "./marshal"

/**
 * Market's dispute details. Only one field would have value rest would be null."
 */
export class MarketDisputeMechanism {
  private _authorized!: string | undefined | null
  private _court!: boolean | undefined | null
  private _simpleDisputes!: boolean | undefined | null

  constructor(props?: Partial<Omit<MarketDisputeMechanism, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._authorized = json.authorized == null ? undefined : marshal.string.fromJSON(json.authorized)
      this._court = json.court == null ? undefined : marshal.boolean.fromJSON(json.court)
      this._simpleDisputes = json.simpleDisputes == null ? undefined : marshal.boolean.fromJSON(json.simpleDisputes)
    }
  }

  /**
   * Account address
   */
  get authorized(): string | undefined | null {
    return this._authorized
  }

  set authorized(value: string | undefined | null) {
    this._authorized = value
  }

  /**
   * True if mechanism is court else null
   */
  get court(): boolean | undefined | null {
    return this._court
  }

  set court(value: boolean | undefined | null) {
    this._court = value
  }

  /**
   * True if mechanism is simple-disputes else null
   */
  get simpleDisputes(): boolean | undefined | null {
    return this._simpleDisputes
  }

  set simpleDisputes(value: boolean | undefined | null) {
    this._simpleDisputes = value
  }

  toJSON(): object {
    return {
      authorized: this.authorized,
      court: this.court,
      simpleDisputes: this.simpleDisputes,
    }
  }
}
