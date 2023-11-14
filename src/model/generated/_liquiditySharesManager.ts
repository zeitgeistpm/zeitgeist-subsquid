import assert from "assert"
import * as marshal from "./marshal"

export class LiquiditySharesManager {
    private _fees!: bigint
    private _owner!: string
    private _totalShares!: bigint

    constructor(props?: Partial<Omit<LiquiditySharesManager, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._fees = marshal.bigint.fromJSON(json.fees)
            this._owner = marshal.string.fromJSON(json.owner)
            this._totalShares = marshal.bigint.fromJSON(json.totalShares)
        }
    }

    get fees(): bigint {
        assert(this._fees != null, 'uninitialized access')
        return this._fees
    }

    set fees(value: bigint) {
        this._fees = value
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

    toJSON(): object {
        return {
            fees: marshal.bigint.toJSON(this.fees),
            owner: this.owner,
            totalShares: marshal.bigint.toJSON(this.totalShares),
        }
    }
}
