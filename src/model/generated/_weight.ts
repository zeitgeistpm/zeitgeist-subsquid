import assert from "assert"
import * as marshal from "./marshal"

/**
 * Asset weightage details
 */
export class Weight {
    private _assetId!: string
    private _len!: bigint

    constructor(props?: Partial<Omit<Weight, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._assetId = marshal.string.fromJSON(json.assetId)
            this._len = marshal.bigint.fromJSON(json.len)
        }
    }

    /**
     * Zeitgeist's identifier for asset
     */
    get assetId(): string {
        assert(this._assetId != null, 'uninitialized access')
        return this._assetId
    }

    set assetId(value: string) {
        this._assetId = value
    }

    /**
     * Length or weight of the asset
     */
    get len(): bigint {
        assert(this._len != null, 'uninitialized access')
        return this._len
    }

    set len(value: bigint) {
        this._len = value
    }

    toJSON(): object {
        return {
            assetId: this.assetId,
            len: marshal.bigint.toJSON(this.len),
        }
    }
}
