import assert from "assert"
import * as marshal from "./marshal"

export class LiquiditySharesManager {
    private _owner!: string | undefined | null
    private _totalShares!: bigint
    private _fees!: bigint | undefined | null

    constructor(props?: Partial<Omit<LiquiditySharesManager, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._owner = json.owner == null ? undefined : marshal.string.fromJSON(json.owner)
            this._totalShares = marshal.bigint.fromJSON(json.totalShares)
            this._fees = json.fees == null ? undefined : marshal.bigint.fromJSON(json.fees)
        }
    }

    get owner(): string | undefined | null {
        return this._owner
    }

    set owner(value: string | undefined | null) {
        this._owner = value
    }

    get totalShares(): bigint {
        assert(this._totalShares != null, 'uninitialized access')
        return this._totalShares
    }

    set totalShares(value: bigint) {
        this._totalShares = value
    }

    get fees(): bigint | undefined | null {
        return this._fees
    }

    set fees(value: bigint | undefined | null) {
        this._fees = value
    }

    toJSON(): object {
        return {
            owner: this.owner,
            totalShares: marshal.bigint.toJSON(this.totalShares),
            fees: this.fees == null ? undefined : marshal.bigint.toJSON(this.fees),
        }
    }
}
