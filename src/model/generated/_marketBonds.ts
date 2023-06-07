import assert from "assert"
import * as marshal from "./marshal"
import {MarketBond} from "./_marketBond"

/**
 * Amount reserved for creation of markets, selecting oracles, joining the council,
 * making treasury proposals, setting on-chain identities, voting,
 * creating DAOs, and other parts of the protocol.
 */
export class MarketBonds {
    private _creation!: MarketBond
    private _oracle!: MarketBond

    constructor(props?: Partial<Omit<MarketBonds, 'toJSON'>>, json?: any) {
        Object.assign(this, props)
        if (json != null) {
            this._creation = new MarketBond(undefined, marshal.nonNull(json.creation))
            this._oracle = new MarketBond(undefined, marshal.nonNull(json.oracle))
        }
    }

    /**
     * Bond associated with creation of markets
     */
    get creation(): MarketBond {
        assert(this._creation != null, 'uninitialized access')
        return this._creation
    }

    set creation(value: MarketBond) {
        this._creation = value
    }

    /**
     * Bond associated with oracle selection
     */
    get oracle(): MarketBond {
        assert(this._oracle != null, 'uninitialized access')
        return this._oracle
    }

    set oracle(value: MarketBond) {
        this._oracle = value
    }

    toJSON(): object {
        return {
            creation: this.creation.toJSON(),
            oracle: this.oracle.toJSON(),
        }
    }
}
