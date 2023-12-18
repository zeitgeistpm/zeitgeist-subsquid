import assert from "assert"
import * as marshal from "./marshal"

/**
 * Extrinsic data
 */
export class Extrinsic {
    private _hash!: string

    constructor(props?: Partial<Omit<Extrinsic, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._hash = marshal.string.fromJSON(json.hash)
        }
    }

    /**
     * Extrinsic hash
     */
    get hash(): string {
        assert(this._hash != null, 'uninitialized access')
        return this._hash
    }

    set hash(value: string) {
        this._hash = value
    }

    toJSON(): object {
        return {
            hash: this.hash,
        }
    }
}
