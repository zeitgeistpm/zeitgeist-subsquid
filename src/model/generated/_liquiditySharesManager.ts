import assert from "assert"
import * as marshal from "./marshal"

export class LiquiditySharesManager {
    private _owner!: string
    private _totalShares!: bigint
    private _fees!: bigint

    constructor(props?: Partial<Omit<LiquiditySharesManager, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._owner = marshal.string.fromJSON(json.owner)
            this._totalShares = marshal.bigint.fromJSON(json.totalShares)
            this._fees = marshal.bigint.fromJSON(json.fees)
        }
    }

    get owner(): string {
        assert(this._owner != null, 'uninitialized access')
        return this._owner
    }

    set owner(value: string) {
        this._owner = value
    }

    get totalShares(): bigint {
        assert(this._totalShares != null, 'uninitialized access')
        return this._totalShares
    }

    set totalShares(value: bigint) {
        this._totalShares = value
    }

    get fees(): bigint {
        assert(this._fees != null, 'uninitialized access')
        return this._fees
    }

    set fees(value: bigint) {
        this._fees = value
    }

    toJSON(): object {
        return {
            owner: this.owner,
            totalShares: marshal.bigint.toJSON(this.totalShares),
            fees: marshal.bigint.toJSON(this.fees),
        }
    }
}
