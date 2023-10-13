import assert from "assert"
import * as marshal from "./marshal"
import {OutcomeReport} from "./_outcomeReport"

/**
 * Market's report details
 */
export class MarketReport {
    private _at!: number | undefined | null
    private _by!: string | undefined | null
    private _outcome!: OutcomeReport | undefined | null

    constructor(props?: Partial<Omit<MarketReport, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._at = json.at == null ? undefined : marshal.int.fromJSON(json.at)
            this._by = json.by == null ? undefined : marshal.string.fromJSON(json.by)
            this._outcome = json.outcome == null ? undefined : new OutcomeReport(undefined, json.outcome)
        }
    }

    /**
     * Block number
     */
    get at(): number | undefined | null {
        return this._at
    }

    set at(value: number | undefined | null) {
        this._at = value
    }

    /**
     * Account which reported
     */
    get by(): string | undefined | null {
        return this._by
    }

    set by(value: string | undefined | null) {
        this._by = value
    }

    /**
     * Outcome details
     */
    get outcome(): OutcomeReport | undefined | null {
        return this._outcome
    }

    set outcome(value: OutcomeReport | undefined | null) {
        this._outcome = value
    }

    toJSON(): object {
        return {
            at: this.at,
            by: this.by,
            outcome: this.outcome == null ? undefined : this.outcome.toJSON(),
        }
    }
}
