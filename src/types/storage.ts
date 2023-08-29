import assert from 'assert'
import {Block, BlockContext, Chain, ChainContext, Option, Result, StorageBase} from './support'
import * as v23 from './v23'
import * as v32 from './v32'
import * as v38 from './v38'
import * as v40 from './v40'
import * as v41 from './v41'
import * as v42 from './v42'
import * as v46 from './v46'
import * as v48 from './v48'

export class AssetRegistryMetadataStorage extends StorageBase {
    protected getPrefix() {
        return 'AssetRegistry'
    }

    protected getName() {
        return 'Metadata'
    }

    /**
     *  The metadata of an asset, indexed by asset id.
     */
    get isV41(): boolean {
        return this.getTypeHash() === '3a1bbd58e36b2f8aa278c13faa0dc576a8999da27d52c289b610408ff000886c'
    }

    /**
     *  The metadata of an asset, indexed by asset id.
     */
    get asV41(): AssetRegistryMetadataStorageV41 {
        assert(this.isV41)
        return this as any
    }

    /**
     *  The metadata of an asset, indexed by asset id.
     */
    get isV42(): boolean {
        return this.getTypeHash() === '2e0ab0cb7391ee43866504f39263a553856fae13ca3dcdc5ed8ab358681279f7'
    }

    /**
     *  The metadata of an asset, indexed by asset id.
     */
    get asV42(): AssetRegistryMetadataStorageV42 {
        assert(this.isV42)
        return this as any
    }

    /**
     *  The metadata of an asset, indexed by asset id.
     */
    get isV48(): boolean {
        return this.getTypeHash() === 'b7425561a5c46347602ccf3a2d15aaf0d34fc2621e47cb1520d4503a3af3cd28'
    }

    /**
     *  The metadata of an asset, indexed by asset id.
     */
    get asV48(): AssetRegistryMetadataStorageV48 {
        assert(this.isV48)
        return this as any
    }
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface AssetRegistryMetadataStorageV41 {
    get(key: v41.Asset): Promise<(v41.AssetMetadata | undefined)>
    getAll(): Promise<v41.AssetMetadata[]>
    getMany(keys: v41.Asset[]): Promise<(v41.AssetMetadata | undefined)[]>
    getKeys(): Promise<v41.Asset[]>
    getKeys(key: v41.Asset): Promise<v41.Asset[]>
    getKeysPaged(pageSize: number): AsyncIterable<v41.Asset[]>
    getKeysPaged(pageSize: number, key: v41.Asset): AsyncIterable<v41.Asset[]>
    getPairs(): Promise<[k: v41.Asset, v: v41.AssetMetadata][]>
    getPairs(key: v41.Asset): Promise<[k: v41.Asset, v: v41.AssetMetadata][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: v41.Asset, v: v41.AssetMetadata][]>
    getPairsPaged(pageSize: number, key: v41.Asset): AsyncIterable<[k: v41.Asset, v: v41.AssetMetadata][]>
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface AssetRegistryMetadataStorageV42 {
    get(key: v42.Asset): Promise<(v42.AssetMetadata | undefined)>
    getAll(): Promise<v42.AssetMetadata[]>
    getMany(keys: v42.Asset[]): Promise<(v42.AssetMetadata | undefined)[]>
    getKeys(): Promise<v42.Asset[]>
    getKeys(key: v42.Asset): Promise<v42.Asset[]>
    getKeysPaged(pageSize: number): AsyncIterable<v42.Asset[]>
    getKeysPaged(pageSize: number, key: v42.Asset): AsyncIterable<v42.Asset[]>
    getPairs(): Promise<[k: v42.Asset, v: v42.AssetMetadata][]>
    getPairs(key: v42.Asset): Promise<[k: v42.Asset, v: v42.AssetMetadata][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: v42.Asset, v: v42.AssetMetadata][]>
    getPairsPaged(pageSize: number, key: v42.Asset): AsyncIterable<[k: v42.Asset, v: v42.AssetMetadata][]>
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface AssetRegistryMetadataStorageV48 {
    get(key: v48.Asset): Promise<(v48.AssetMetadata | undefined)>
    getAll(): Promise<v48.AssetMetadata[]>
    getMany(keys: v48.Asset[]): Promise<(v48.AssetMetadata | undefined)[]>
    getKeys(): Promise<v48.Asset[]>
    getKeys(key: v48.Asset): Promise<v48.Asset[]>
    getKeysPaged(pageSize: number): AsyncIterable<v48.Asset[]>
    getKeysPaged(pageSize: number, key: v48.Asset): AsyncIterable<v48.Asset[]>
    getPairs(): Promise<[k: v48.Asset, v: v48.AssetMetadata][]>
    getPairs(key: v48.Asset): Promise<[k: v48.Asset, v: v48.AssetMetadata][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: v48.Asset, v: v48.AssetMetadata][]>
    getPairsPaged(pageSize: number, key: v48.Asset): AsyncIterable<[k: v48.Asset, v: v48.AssetMetadata][]>
}

export class MarketCommonsMarketsStorage extends StorageBase {
    protected getPrefix() {
        return 'MarketCommons'
    }

    protected getName() {
        return 'Markets'
    }

    /**
     *  Holds all markets
     */
    get isV23(): boolean {
        return this.getTypeHash() === '71ab4a5fd082e66e0f7bfe5377771881b06162ae81d40f6b9e5dfe45c2708ac3'
    }

    /**
     *  Holds all markets
     */
    get asV23(): MarketCommonsMarketsStorageV23 {
        assert(this.isV23)
        return this as any
    }

    /**
     *  Holds all markets
     */
    get isV32(): boolean {
        return this.getTypeHash() === '67bd271b1b95e6aae699f0ee769034cb86529cac2162b875db2a369aa8fe68cf'
    }

    /**
     *  Holds all markets
     */
    get asV32(): MarketCommonsMarketsStorageV32 {
        assert(this.isV32)
        return this as any
    }

    /**
     *  Holds all markets
     */
    get isV38(): boolean {
        return this.getTypeHash() === '55ada2a62fd3efc4fb1e1cfc8408a6c4724da02fb0c33607d093549879e68a5b'
    }

    /**
     *  Holds all markets
     */
    get asV38(): MarketCommonsMarketsStorageV38 {
        assert(this.isV38)
        return this as any
    }

    /**
     *  Holds all markets
     */
    get isV40(): boolean {
        return this.getTypeHash() === 'c975f07feb390b832e33b16164c7e83cc3f0e0767ee1ab31f7fe2fc7c64bf4ee'
    }

    /**
     *  Holds all markets
     */
    get asV40(): MarketCommonsMarketsStorageV40 {
        assert(this.isV40)
        return this as any
    }

    /**
     *  Holds all markets
     */
    get isV41(): boolean {
        return this.getTypeHash() === 'c40d832b2b21dedbe475029e4a36645ccbdb04426cbebc79e27252dbe5ab75df'
    }

    /**
     *  Holds all markets
     */
    get asV41(): MarketCommonsMarketsStorageV41 {
        assert(this.isV41)
        return this as any
    }

    /**
     *  Holds all markets
     */
    get isV42(): boolean {
        return this.getTypeHash() === '5dff1b5b718461ed75e820e1bd5ec31d59539e5b1f95a0f3a2dac7c1b4e2c6b6'
    }

    /**
     *  Holds all markets
     */
    get asV42(): MarketCommonsMarketsStorageV42 {
        assert(this.isV42)
        return this as any
    }

    /**
     *  Holds all markets
     */
    get isV46(): boolean {
        return this.getTypeHash() === 'f17f1b50ff6dde016a6732ed2bdaa0479f67c8bac03488cead37b6e8f9b3a8c6'
    }

    /**
     *  Holds all markets
     */
    get asV46(): MarketCommonsMarketsStorageV46 {
        assert(this.isV46)
        return this as any
    }
}

/**
 *  Holds all markets
 */
export interface MarketCommonsMarketsStorageV23 {
    get(key: bigint): Promise<(v23.Market | undefined)>
    getAll(): Promise<v23.Market[]>
    getMany(keys: bigint[]): Promise<(v23.Market | undefined)[]>
    getKeys(): Promise<bigint[]>
    getKeys(key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, key: bigint): AsyncIterable<bigint[]>
    getPairs(): Promise<[k: bigint, v: v23.Market][]>
    getPairs(key: bigint): Promise<[k: bigint, v: v23.Market][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: bigint, v: v23.Market][]>
    getPairsPaged(pageSize: number, key: bigint): AsyncIterable<[k: bigint, v: v23.Market][]>
}

/**
 *  Holds all markets
 */
export interface MarketCommonsMarketsStorageV32 {
    get(key: bigint): Promise<(v32.Market | undefined)>
    getAll(): Promise<v32.Market[]>
    getMany(keys: bigint[]): Promise<(v32.Market | undefined)[]>
    getKeys(): Promise<bigint[]>
    getKeys(key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, key: bigint): AsyncIterable<bigint[]>
    getPairs(): Promise<[k: bigint, v: v32.Market][]>
    getPairs(key: bigint): Promise<[k: bigint, v: v32.Market][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: bigint, v: v32.Market][]>
    getPairsPaged(pageSize: number, key: bigint): AsyncIterable<[k: bigint, v: v32.Market][]>
}

/**
 *  Holds all markets
 */
export interface MarketCommonsMarketsStorageV38 {
    get(key: bigint): Promise<(v38.Market | undefined)>
    getAll(): Promise<v38.Market[]>
    getMany(keys: bigint[]): Promise<(v38.Market | undefined)[]>
    getKeys(): Promise<bigint[]>
    getKeys(key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, key: bigint): AsyncIterable<bigint[]>
    getPairs(): Promise<[k: bigint, v: v38.Market][]>
    getPairs(key: bigint): Promise<[k: bigint, v: v38.Market][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: bigint, v: v38.Market][]>
    getPairsPaged(pageSize: number, key: bigint): AsyncIterable<[k: bigint, v: v38.Market][]>
}

/**
 *  Holds all markets
 */
export interface MarketCommonsMarketsStorageV40 {
    get(key: bigint): Promise<(v40.Market | undefined)>
    getAll(): Promise<v40.Market[]>
    getMany(keys: bigint[]): Promise<(v40.Market | undefined)[]>
    getKeys(): Promise<bigint[]>
    getKeys(key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, key: bigint): AsyncIterable<bigint[]>
    getPairs(): Promise<[k: bigint, v: v40.Market][]>
    getPairs(key: bigint): Promise<[k: bigint, v: v40.Market][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: bigint, v: v40.Market][]>
    getPairsPaged(pageSize: number, key: bigint): AsyncIterable<[k: bigint, v: v40.Market][]>
}

/**
 *  Holds all markets
 */
export interface MarketCommonsMarketsStorageV41 {
    get(key: bigint): Promise<(v41.Market | undefined)>
    getAll(): Promise<v41.Market[]>
    getMany(keys: bigint[]): Promise<(v41.Market | undefined)[]>
    getKeys(): Promise<bigint[]>
    getKeys(key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, key: bigint): AsyncIterable<bigint[]>
    getPairs(): Promise<[k: bigint, v: v41.Market][]>
    getPairs(key: bigint): Promise<[k: bigint, v: v41.Market][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: bigint, v: v41.Market][]>
    getPairsPaged(pageSize: number, key: bigint): AsyncIterable<[k: bigint, v: v41.Market][]>
}

/**
 *  Holds all markets
 */
export interface MarketCommonsMarketsStorageV42 {
    get(key: bigint): Promise<(v42.Market | undefined)>
    getAll(): Promise<v42.Market[]>
    getMany(keys: bigint[]): Promise<(v42.Market | undefined)[]>
    getKeys(): Promise<bigint[]>
    getKeys(key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, key: bigint): AsyncIterable<bigint[]>
    getPairs(): Promise<[k: bigint, v: v42.Market][]>
    getPairs(key: bigint): Promise<[k: bigint, v: v42.Market][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: bigint, v: v42.Market][]>
    getPairsPaged(pageSize: number, key: bigint): AsyncIterable<[k: bigint, v: v42.Market][]>
}

/**
 *  Holds all markets
 */
export interface MarketCommonsMarketsStorageV46 {
    get(key: bigint): Promise<(v46.Market | undefined)>
    getAll(): Promise<v46.Market[]>
    getMany(keys: bigint[]): Promise<(v46.Market | undefined)[]>
    getKeys(): Promise<bigint[]>
    getKeys(key: bigint): Promise<bigint[]>
    getKeysPaged(pageSize: number): AsyncIterable<bigint[]>
    getKeysPaged(pageSize: number, key: bigint): AsyncIterable<bigint[]>
    getPairs(): Promise<[k: bigint, v: v46.Market][]>
    getPairs(key: bigint): Promise<[k: bigint, v: v46.Market][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: bigint, v: v46.Market][]>
    getPairsPaged(pageSize: number, key: bigint): AsyncIterable<[k: bigint, v: v46.Market][]>
}
