import {sts, Block, Bytes, Option, Result, StorageType, RuntimeCtx} from '../support'
import * as v41 from '../v41'
import * as v42 from '../v42'
import * as v48 from '../v48'
import * as v49 from '../v49'
import * as v51 from '../v51'
import * as v54 from '../v54'

export const metadata =  {
    /**
     *  The metadata of an asset, indexed by asset id.
     */
    v41: new StorageType('AssetRegistry.Metadata', 'Optional', [v41.Asset], v41.AssetMetadata) as MetadataV41,
    /**
     *  The metadata of an asset, indexed by asset id.
     */
    v42: new StorageType('AssetRegistry.Metadata', 'Optional', [v42.Asset], v42.AssetMetadata) as MetadataV42,
    /**
     *  The metadata of an asset, indexed by asset id.
     */
    v48: new StorageType('AssetRegistry.Metadata', 'Optional', [v48.Asset], v48.AssetMetadata) as MetadataV48,
    /**
     *  The metadata of an asset, indexed by asset id.
     */
    v49: new StorageType('AssetRegistry.Metadata', 'Optional', [v49.Asset], v49.AssetMetadata) as MetadataV49,
    /**
     *  The metadata of an asset, indexed by asset id.
     */
    v51: new StorageType('AssetRegistry.Metadata', 'Optional', [v51.Asset], v51.AssetMetadata) as MetadataV51,
    /**
     *  The metadata of an asset, indexed by asset id.
     */
    v54: new StorageType('AssetRegistry.Metadata', 'Optional', [v54.XcmAssetClass], v54.AssetMetadata) as MetadataV54,
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface MetadataV41  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: v41.Asset): Promise<(v41.AssetMetadata | undefined)>
    getMany(block: Block, keys: v41.Asset[]): Promise<(v41.AssetMetadata | undefined)[]>
    getKeys(block: Block): Promise<v41.Asset[]>
    getKeys(block: Block, key: v41.Asset): Promise<v41.Asset[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v41.Asset[]>
    getKeysPaged(pageSize: number, block: Block, key: v41.Asset): AsyncIterable<v41.Asset[]>
    getPairs(block: Block): Promise<[k: v41.Asset, v: (v41.AssetMetadata | undefined)][]>
    getPairs(block: Block, key: v41.Asset): Promise<[k: v41.Asset, v: (v41.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v41.Asset, v: (v41.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v41.Asset): AsyncIterable<[k: v41.Asset, v: (v41.AssetMetadata | undefined)][]>
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface MetadataV42  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: v42.Asset): Promise<(v42.AssetMetadata | undefined)>
    getMany(block: Block, keys: v42.Asset[]): Promise<(v42.AssetMetadata | undefined)[]>
    getKeys(block: Block): Promise<v42.Asset[]>
    getKeys(block: Block, key: v42.Asset): Promise<v42.Asset[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v42.Asset[]>
    getKeysPaged(pageSize: number, block: Block, key: v42.Asset): AsyncIterable<v42.Asset[]>
    getPairs(block: Block): Promise<[k: v42.Asset, v: (v42.AssetMetadata | undefined)][]>
    getPairs(block: Block, key: v42.Asset): Promise<[k: v42.Asset, v: (v42.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v42.Asset, v: (v42.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v42.Asset): AsyncIterable<[k: v42.Asset, v: (v42.AssetMetadata | undefined)][]>
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface MetadataV48  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: v48.Asset): Promise<(v48.AssetMetadata | undefined)>
    getMany(block: Block, keys: v48.Asset[]): Promise<(v48.AssetMetadata | undefined)[]>
    getKeys(block: Block): Promise<v48.Asset[]>
    getKeys(block: Block, key: v48.Asset): Promise<v48.Asset[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v48.Asset[]>
    getKeysPaged(pageSize: number, block: Block, key: v48.Asset): AsyncIterable<v48.Asset[]>
    getPairs(block: Block): Promise<[k: v48.Asset, v: (v48.AssetMetadata | undefined)][]>
    getPairs(block: Block, key: v48.Asset): Promise<[k: v48.Asset, v: (v48.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v48.Asset, v: (v48.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v48.Asset): AsyncIterable<[k: v48.Asset, v: (v48.AssetMetadata | undefined)][]>
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface MetadataV49  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: v49.Asset): Promise<(v49.AssetMetadata | undefined)>
    getMany(block: Block, keys: v49.Asset[]): Promise<(v49.AssetMetadata | undefined)[]>
    getKeys(block: Block): Promise<v49.Asset[]>
    getKeys(block: Block, key: v49.Asset): Promise<v49.Asset[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v49.Asset[]>
    getKeysPaged(pageSize: number, block: Block, key: v49.Asset): AsyncIterable<v49.Asset[]>
    getPairs(block: Block): Promise<[k: v49.Asset, v: (v49.AssetMetadata | undefined)][]>
    getPairs(block: Block, key: v49.Asset): Promise<[k: v49.Asset, v: (v49.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v49.Asset, v: (v49.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v49.Asset): AsyncIterable<[k: v49.Asset, v: (v49.AssetMetadata | undefined)][]>
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface MetadataV51  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: v51.Asset): Promise<(v51.AssetMetadata | undefined)>
    getMany(block: Block, keys: v51.Asset[]): Promise<(v51.AssetMetadata | undefined)[]>
    getKeys(block: Block): Promise<v51.Asset[]>
    getKeys(block: Block, key: v51.Asset): Promise<v51.Asset[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v51.Asset[]>
    getKeysPaged(pageSize: number, block: Block, key: v51.Asset): AsyncIterable<v51.Asset[]>
    getPairs(block: Block): Promise<[k: v51.Asset, v: (v51.AssetMetadata | undefined)][]>
    getPairs(block: Block, key: v51.Asset): Promise<[k: v51.Asset, v: (v51.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v51.Asset, v: (v51.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v51.Asset): AsyncIterable<[k: v51.Asset, v: (v51.AssetMetadata | undefined)][]>
}

/**
 *  The metadata of an asset, indexed by asset id.
 */
export interface MetadataV54  {
    is(block: RuntimeCtx): boolean
    get(block: Block, key: v54.XcmAssetClass): Promise<(v54.AssetMetadata | undefined)>
    getMany(block: Block, keys: v54.XcmAssetClass[]): Promise<(v54.AssetMetadata | undefined)[]>
    getKeys(block: Block): Promise<v54.XcmAssetClass[]>
    getKeys(block: Block, key: v54.XcmAssetClass): Promise<v54.XcmAssetClass[]>
    getKeysPaged(pageSize: number, block: Block): AsyncIterable<v54.XcmAssetClass[]>
    getKeysPaged(pageSize: number, block: Block, key: v54.XcmAssetClass): AsyncIterable<v54.XcmAssetClass[]>
    getPairs(block: Block): Promise<[k: v54.XcmAssetClass, v: (v54.AssetMetadata | undefined)][]>
    getPairs(block: Block, key: v54.XcmAssetClass): Promise<[k: v54.XcmAssetClass, v: (v54.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block): AsyncIterable<[k: v54.XcmAssetClass, v: (v54.AssetMetadata | undefined)][]>
    getPairsPaged(pageSize: number, block: Block, key: v54.XcmAssetClass): AsyncIterable<[k: v54.XcmAssetClass, v: (v54.AssetMetadata | undefined)][]>
}
