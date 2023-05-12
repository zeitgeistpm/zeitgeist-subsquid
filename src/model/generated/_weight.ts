import assert from "assert"
import * as marshal from "./marshal"

/**
 * Asset weightage details
 */
export class Weight {
    private _assetId!: string
    private _weight!: bigint

    constructor(props?: Partial<Omit<Weight, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._assetId = marshal.string.fromJSON(json.assetId)
            this._weight = marshal.bigint.fromJSON(json.weight)
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
     * Weight of the asset
     */
    get weight(): bigint {
        assert(this._weight != null, 'uninitialized access')
        return this._weight
    }

    set weight(value: bigint) {
        this._weight = value
    }

    toJSON(): object {
        return {
            assetId: this.assetId,
            weight: marshal.bigint.toJSON(this.weight),
        }
    }
}
