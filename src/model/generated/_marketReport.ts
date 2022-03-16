import assert from "assert"
import * as marshal from "./marshal"
import {OutcomeReport} from "./_outcomeReport"

/**
 * Market's report details
 */
export class MarketReport {
  private _at!: number
  private _by!: string
  private _outcome!: OutcomeReport

  constructor(props?: Partial<Omit<MarketReport, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._at = marshal.int.fromJSON(json.at)
      this._by = marshal.string.fromJSON(json.by)
      this._outcome = new OutcomeReport(undefined, marshal.nonNull(json.outcome))
    }
  }

  /**
   * Block number
   */
  get at(): number {
    assert(this._at != null, 'uninitialized access')
    return this._at
  }

  set at(value: number) {
    this._at = value
  }

  /**
   * Account which reported
   */
  get by(): string {
    assert(this._by != null, 'uninitialized access')
    return this._by
  }

  set by(value: string) {
    this._by = value
  }

  /**
   * Outcome details
   */
  get outcome(): OutcomeReport {
    assert(this._outcome != null, 'uninitialized access')
    return this._outcome
  }

  set outcome(value: OutcomeReport) {
    this._outcome = value
  }

  toJSON(): object {
    return {
      at: this.at,
      by: this.by,
      outcome: this.outcome.toJSON(),
    }
  }
}
