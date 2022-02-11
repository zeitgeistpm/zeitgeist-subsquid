import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import { Asset, CommonPoolEventParams, Pool, PoolAssetsEvent, SwapEvent } from '@zeitgeistpm/typesV1/dist/interfaces';

export namespace Swaps {
    /**
     *  A new pool has been created. \[CommonPoolEventParams, pool\]
     *
     *  Event parameters: [CommonPoolEventParams<<T as frame_system::Config>::AccountId>, Pool<BalanceOf<T>, T::MarketId>, ]
     */
    export class PoolCreateEvent {
        public readonly expectedParamTypes = [
            'CommonPoolEventParams<<T as frame_system::Config>::AccountId>', 
            'Pool<BalanceOf<T>, T::MarketId>', 
        ]

        constructor(public readonly ctx: SubstrateEvent) {}

        get params(): [CommonPoolEventParams,Pool] {

            return [
                (createTypeUnsafe<CommonPoolEventParams & Codec>(
                    typeRegistry,
                    'CommonPoolEventParams',
                    [this.ctx.params[0].value]
                ) as any) as CommonPoolEventParams,
                (createTypeUnsafe<Pool & Codec>(
                    typeRegistry,
                    "Pool", 
                    this.reformatWeights([this.ctx.params[1].value])
                ) as any) as Pool,
            ]
        }

        validateParams(): boolean {
            if (this.expectedParamTypes.length !== this.ctx.params.length) {
                return false
            }
            let valid = true
            this.expectedParamTypes.forEach((type, i) => {
                if (type !== this.ctx.params[i].type) {
                    valid = false
                }
            })
            return valid
        }

        reformatWeights(arg: any[]): any[] {
            if (arg[0].weights) {
                var map = new Map()
                Object.entries(arg[0].weights).map(entry => {
                    const marketId = arg[0].market_id
                    if (entry[0].length > 5) {
                        const catIdx = entry[0].substring(entry[0].indexOf(',')+1, entry[0].indexOf(']'))
                        const asset = (createTypeUnsafe<Asset & Codec>(
                            typeRegistry,
                            'Asset',
                            [{ categoricalOutcome: [marketId, catIdx] }]
                        ))
                        map.set(asset, entry[1])
                    } else {
                        const asset = (createTypeUnsafe<Asset & Codec>(
                            typeRegistry,
                            'Asset',
                            [{ Ztg: null }]
                        ))
                        map.set(asset, entry[1])
                    }
                });
                arg[0].weights = map;
            }
            return arg;
        }
    }

    /**
     *  Someone has exited a pool. \[PoolAssetsEvent\]
     *
     *  Event parameters: [PoolAssetsEvent<<T as frame_system::Config>::AccountId, Asset<T::MarketId>, BalanceOf<T>,>, ]
     */
    export class PoolExitEvent {
        public readonly expectedParamTypes = ['PoolAssetsEvent<<T as frame_system::Config>::AccountId, Asset<T::MarketId>, BalanceOf<T>,>', ]

        constructor(public readonly ctx: SubstrateEvent) {}

        get params(): [PoolAssetsEvent] {

            return [(createTypeUnsafe<PoolAssetsEvent & Codec>(
            typeRegistry, 'PoolAssetsEvent', [this.ctx.params[0].value]) as any) as PoolAssetsEvent ]
        }

        validateParams(): boolean {
            if (this.expectedParamTypes.length !== this.ctx.params.length) {
                return false
            }
            let valid = true
            this.expectedParamTypes.forEach((type, i) => {
                if (type !== this.ctx.params[i].type) {
                    valid = false
                }
            })
            return valid
        }

    }

    /**
     *  Someone has joined a pool. \[PoolAssetsEvent\]
     *
     *  Event parameters: [PoolAssetsEvent<<T as frame_system::Config>::AccountId, Asset<T::MarketId>, BalanceOf<T>,>, ]
     */
    export class PoolJoinEvent {
        public readonly expectedParamTypes = ['PoolAssetsEvent<<T as frame_system::Config>::AccountId, Asset<T::MarketId>, BalanceOf<T>,>', ]

        constructor(public readonly ctx: SubstrateEvent) {}

        get params(): [PoolAssetsEvent] {

            return [(createTypeUnsafe<PoolAssetsEvent & Codec>(
            typeRegistry, 'PoolAssetsEvent', [this.ctx.params[0].value]) as any) as PoolAssetsEvent ]
        }

        validateParams(): boolean {
            if (this.expectedParamTypes.length !== this.ctx.params.length) {
                return false
            }
            let valid = true
            this.expectedParamTypes.forEach((type, i) => {
                if (type !== this.ctx.params[i].type) {
                    valid = false
                }
            })
            return valid
        }

    }

    /**
     *  An exact amount of an asset is entering the pool. \[SwapEvent\]
     *
     *  Event parameters: [SwapEvent<<T as frame_system::Config>::AccountId, Asset<T::MarketId>, BalanceOf<T>>, ]
     */
    export class SwapExactAmountInEvent {
        public readonly expectedParamTypes = [
            'SwapEvent<<T as frame_system::Config>::AccountId, Asset<T::MarketId>, BalanceOf<T>>', 
        ]

        constructor(public readonly ctx: SubstrateEvent) {}

        get params(): [SwapEvent] {

            return [(createTypeUnsafe<SwapEvent & Codec>(
            typeRegistry, 'SwapEvent', [this.ctx.params[0].value]) as any) as SwapEvent ]
        }

        validateParams(): boolean {
            if (this.expectedParamTypes.length !== this.ctx.params.length) {
                return false
            }
            let valid = true
            this.expectedParamTypes.forEach((type, i) => {
                if (type !== this.ctx.params[i].type) {
                    valid = false
                }
            })
            return valid
        }

    }

    /**
     *  An exact amount of an asset is leaving the pool. \[SwapEvent\]
     *
     *  Event parameters: [SwapEvent<<T as frame_system::Config>::AccountId, Asset<T::MarketId>, BalanceOf<T>>, ]
     */
    export class SwapExactAmountOutEvent {
        public readonly expectedParamTypes = [
            'SwapEvent<<T as frame_system::Config>::AccountId, Asset<T::MarketId>, BalanceOf<T>>', 
        ]

        constructor(public readonly ctx: SubstrateEvent) {}

        get params(): [SwapEvent] {

            return [(createTypeUnsafe<SwapEvent & Codec>(
            typeRegistry, 'SwapEvent', [this.ctx.params[0].value]) as any) as SwapEvent ]
        }

        validateParams(): boolean {
            if (this.expectedParamTypes.length !== this.ctx.params.length) {
                return false
            }
            let valid = true
            this.expectedParamTypes.forEach((type, i) => {
                if (type !== this.ctx.params[i].type) {
                    valid = false
                }
            })
            return valid
        }

    }

}
