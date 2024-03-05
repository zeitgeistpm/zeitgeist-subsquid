import assert from "assert"
import * as marshal from "./marshal"

export class OrderRecord {
    private _asset!: string
    private _filledAmount!: bigint
    private _initialAmount!: bigint

    constructor(props?: Partial<Omit<OrderRecord, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._asset = marshal.string.fromJSON(json.asset)
            this._filledAmount = marshal.bigint.fromJSON(json.filledAmount)
            this._initialAmount = marshal.bigint.fromJSON(json.initialAmount)
        }
    }

    get asset(): string {
        assert(this._asset != null, 'uninitialized access')
        return this._asset
    }

    set asset(value: string) {
        this._asset = value
    }

    get filledAmount(): bigint {
        assert(this._filledAmount != null, 'uninitialized access')
        return this._filledAmount
    }

    set filledAmount(value: bigint) {
        this._filledAmount = value
    }

    get initialAmount(): bigint {
        assert(this._initialAmount != null, 'uninitialized access')
        return this._initialAmount
    }

    set initialAmount(value: bigint) {
        this._initialAmount = value
    }

    toJSON(): object {
        return {
            asset: this.asset,
            filledAmount: marshal.bigint.toJSON(this.filledAmount),
            initialAmount: marshal.bigint.toJSON(this.initialAmount),
        }
    }
}
