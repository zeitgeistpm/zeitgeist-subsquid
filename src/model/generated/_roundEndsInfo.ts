import assert from "assert"
import * as marshal from "./marshal"

export class RoundEndsInfo {
    private _preVote!: bigint | undefined | null
    private _vote!: bigint | undefined | null
    private _aggregation!: bigint | undefined | null
    private _appeal!: bigint | undefined | null

    constructor(props?: Partial<Omit<RoundEndsInfo, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._preVote = json.preVote == null ? undefined : marshal.bigint.fromJSON(json.preVote)
            this._vote = json.vote == null ? undefined : marshal.bigint.fromJSON(json.vote)
            this._aggregation = json.aggregation == null ? undefined : marshal.bigint.fromJSON(json.aggregation)
            this._appeal = json.appeal == null ? undefined : marshal.bigint.fromJSON(json.appeal)
        }
    }

    get preVote(): bigint | undefined | null {
        return this._preVote
    }

    set preVote(value: bigint | undefined | null) {
        this._preVote = value
    }

    get vote(): bigint | undefined | null {
        return this._vote
    }

    set vote(value: bigint | undefined | null) {
        this._vote = value
    }

    get aggregation(): bigint | undefined | null {
        return this._aggregation
    }

    set aggregation(value: bigint | undefined | null) {
        this._aggregation = value
    }

    get appeal(): bigint | undefined | null {
        return this._appeal
    }

    set appeal(value: bigint | undefined | null) {
        this._appeal = value
    }

    toJSON(): object {
        return {
            preVote: this.preVote == null ? undefined : marshal.bigint.toJSON(this.preVote),
            vote: this.vote == null ? undefined : marshal.bigint.toJSON(this.vote),
            aggregation: this.aggregation == null ? undefined : marshal.bigint.toJSON(this.aggregation),
            appeal: this.appeal == null ? undefined : marshal.bigint.toJSON(this.appeal),
        }
    }
}
