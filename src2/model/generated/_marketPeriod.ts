import assert from "assert"
import * as marshal from "./marshal"

/**
 * Time period of the market
 */
export class MarketPeriod {
    private _block!: (bigint | undefined | null)[] | undefined | null
    private _end!: bigint
    private _start!: bigint
    private _timestamp!: (bigint | undefined | null)[] | undefined | null

    constructor(props?: Partial<Omit<MarketPeriod, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._block = json.block == null ? undefined : marshal.fromList(json.block, val => val == null ? undefined : marshal.bigint.fromJSON(val))
            this._end = marshal.bigint.fromJSON(json.end)
            this._start = marshal.bigint.fromJSON(json.start)
            this._timestamp = json.timestamp == null ? undefined : marshal.fromList(json.timestamp, val => val == null ? undefined : marshal.bigint.fromJSON(val))
        }
    }

    /**
     * start & end block numbers
     */
    get block(): (bigint | undefined | null)[] | undefined | null {
        return this._block
    }

    set block(value: (bigint | undefined | null)[] | undefined | null) {
        this._block = value
    }

    /**
     * Timestamp at which market should end
     */
    get end(): bigint {
        assert(this._end != null, 'uninitialized access')
        return this._end
    }

    set end(value: bigint) {
        this._end = value
    }

    /**
     * Timestamp at which market should start
     */
    get start(): bigint {
        assert(this._start != null, 'uninitialized access')
        return this._start
    }

    set start(value: bigint) {
        this._start = value
    }

    /**
     * start & end timestamps
     */
    get timestamp(): (bigint | undefined | null)[] | undefined | null {
        return this._timestamp
    }

    set timestamp(value: (bigint | undefined | null)[] | undefined | null) {
        this._timestamp = value
    }

    toJSON(): object {
        return {
            block: this.block == null ? undefined : this.block.map((val: any) => val == null ? undefined : marshal.bigint.toJSON(val)),
            end: marshal.bigint.toJSON(this.end),
            start: marshal.bigint.toJSON(this.start),
            timestamp: this.timestamp == null ? undefined : this.timestamp.map((val: any) => val == null ? undefined : marshal.bigint.toJSON(val)),
        }
    }
}
