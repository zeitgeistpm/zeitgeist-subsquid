import {sts, Block, Bytes, Option, Result, StorageType, RuntimeCtx} from '../support'
import * as v23 from '../v23'
import * as v32 from '../v32'
import * as v38 from '../v38'
import * as v40 from '../v40'
import * as v41 from '../v41'
import * as v42 from '../v42'
import * as v46 from '../v46'
import * as v49 from '../v49'
import * as v50 from '../v50'
import * as v51 from '../v51'
import * as v53 from '../v53'
import * as v54 from '../v54'
import * as v55 from '../v55'
import * as v56 from '../v56'
import * as v57 from '../v57'

export const markets =  {
    /**
     *  Holds all markets
     */
    v23: new StorageType('MarketCommons.Markets', 'Optional', [v23.MarketId], v23.Market) as MarketsV23,
    /**
     *  Holds all markets
     */
    v32: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v32.Market) as MarketsV32,
    /**
     *  Holds all markets
     */
    v38: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v38.Market) as MarketsV38,
    /**
     *  Holds all markets
     */
    v40: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v40.Market) as MarketsV40,
    /**
     *  Holds all markets
     */
    v41: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v41.Market) as MarketsV41,
    /**
     *  Holds all markets
     */
    v42: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v42.Market) as MarketsV42,
    /**
     *  Holds all markets
     */
    v46: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v46.Market) as MarketsV46,
    /**
     *  Holds all markets
     */
    v49: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v49.Market) as MarketsV49,
    /**
     *  Holds all markets
     */
    v50: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v50.Market) as MarketsV50,
    /**
     *  Holds all markets
     */
    v51: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v51.Market) as MarketsV51,
    /**
     *  Holds all markets
     */
    v53: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v53.Market) as MarketsV53,
    /**
     *  Holds all markets
     */
    v54: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v54.Market) as MarketsV54,
    /**
     *  Holds all markets
     */
    v55: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v55.Market) as MarketsV55,
    /**
     *  Holds all markets
     */
    v56: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v56.Market) as MarketsV56,
    /**
     *  Holds all markets
     */
    v57: new StorageType('MarketCommons.Markets', 'Optional', [sts.bigint()], v57.Market) as MarketsV57,
}

/**
 *  Holds all markets
 */
export interface MarketsV23  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: v23.MarketId): Promise<(v23.Market | undefined)>
    getMany(block: Block, keys: v23.MarketId[]): Promise<(v23.Market | undefined)[]>
    getKeys(block: Block): Promise<v23.MarketId[]>
    getKeys(block: Block, key: v23.MarketId): Promise<v23.MarketId[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v23.MarketId[]>
    getKeysPaged(pageSize: number, block: Block, key: v23.MarketId): AsyncIterable<v23.MarketId[]>
    getPairs(block: Block): Promise<[k: v23.MarketId, v: (v23.Market | undefined)][]>
    getPairs(block: Block, key: v23.MarketId): Promise<[k: v23.MarketId, v: (v23.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v23.MarketId, v: (v23.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v23.MarketId): AsyncIterable<[k: v23.MarketId, v: (v23.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV32  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v32.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v32.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v32.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v32.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v32.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v32.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV38  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v38.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v38.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v38.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v38.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v38.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v38.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV40  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v40.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v40.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v40.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v40.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v40.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v40.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV41  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v41.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v41.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v41.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v41.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v41.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v41.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV42  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v42.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v42.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v42.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v42.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v42.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v42.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV46  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v46.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v46.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v46.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v46.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v46.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v46.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV49  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v49.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v49.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v49.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v49.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v49.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v49.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV50  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v50.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v50.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v50.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v50.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v50.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v50.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV51  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v51.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v51.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v51.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v51.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v51.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v51.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV53  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v53.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v53.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v53.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v53.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v53.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v53.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV54  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v54.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v54.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v54.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v54.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v54.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v54.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV55  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v55.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v55.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v55.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v55.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v55.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v55.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV56  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v56.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v56.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v56.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v56.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v56.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v56.Market | undefined)][]>
}

/**
 *  Holds all markets
 */
export interface MarketsV57  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: bigint): Promise<(v57.Market | undefined)>
    getMany(block: Block, keys: bigint[]): Promise<(v57.Market | undefined)[]>
    getKeys(block: Block): Promise<bigint[]>
    getKeys(block: Block, key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<bigint[]>
    getPairs(block: Block): Promise<[k: bigint, v: (v57.Market | undefined)][]>
    getPairs(block: Block, key: bigint): Promise<[k: bigint, v: (v57.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: bigint, v: (v57.Market | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: bigint): AsyncIterable<[k: bigint, v: (v57.Market | undefined)][]>
}
