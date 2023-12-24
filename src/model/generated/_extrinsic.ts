import assert from "assert"
import * as marshal from "./marshal"

/**
 * Extrinsic data
 */
export class Extrinsic {
    private _hash!: string
    private _name!: string | undefined | null

    constructor(props?: Partial<Omit<Extrinsic, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._hash = marshal.string.fromJSON(json.hash)
            this._name = json.name == null ? undefined : marshal.string.fromJSON(json.name)
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

    /**
     * Name of the extrinsic
     */
    get name(): string | undefined | null {
        return this._name
    }

    set name(value: string | undefined | null) {
        this._name = value
    }

    toJSON(): object {
        return {
            hash: this.hash,
            name: this.name,
        }
    }
}
