import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import {
  CommonPoolEventParams,
  Pool,
  SwapEvent,
} from "@zeitgeistpm/types/dist/interfaces";

export namespace Swaps {
  /**
   *  A new pool has been created. \[CommonPoolEventParams, pool\]
   *
   *  Event parameters: [CommonPoolEventParams<<T as frame_system::Config>::AccountId>, Pool<BalanceOf<T>, T::MarketId>, ]
   */
  export class PoolCreateEvent {
    public readonly expectedParamTypes = [
      "CommonPoolEventParams<<T as frame_system::Config>::AccountId>",
      "Pool<BalanceOf<T>, T::MarketId>",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [CommonPoolEventParams, Pool] {
      return [
        createTypeUnsafe<CommonPoolEventParams & Codec>(
          typeRegistry,
          "CommonPoolEventParams",
          [this.ctx.params[0].value]
        ),
        createTypeUnsafe<Pool & Codec>(typeRegistry, "Pool", this.removeWeights([
          this.ctx.params[1].value,
        ])),
      ];
    }

    validateParams(): boolean {
      if (this.expectedParamTypes.length !== this.ctx.params.length) {
        return false;
      }
      let valid = true;
      this.expectedParamTypes.forEach((type, i) => {
        if (type !== this.ctx.params[i].type) {
          valid = false;
        }
      });
      return valid;
    }

    removeWeights(arg: any[]): any[] {
      if (arg[0].weights) {
        arg[0].weights = null;
      }
      return arg;
    }
  }

  /**
   *  An exact amount of an asset is entering the pool. \[SwapEvent\]
   *
   *  Event parameters: [SwapEvent<<T as frame_system::Config>::AccountId, BalanceOf<T>>, ]
   */
  export class SwapExactAmountInEvent {
    public readonly expectedParamTypes = [
      "SwapEvent<<T as frame_system::Config>::AccountId, BalanceOf<T>>",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [SwapEvent] {
      return [
        createTypeUnsafe<SwapEvent & Codec>(typeRegistry, "SwapEvent", [
          this.ctx.params[0].value,
        ]),
      ];
    }

    validateParams(): boolean {
      if (this.expectedParamTypes.length !== this.ctx.params.length) {
        return false;
      }
      let valid = true;
      this.expectedParamTypes.forEach((type, i) => {
        if (type !== this.ctx.params[i].type) {
          valid = false;
        }
      });
      return valid;
    }
  }

  /**
   *  An exact amount of an asset is leaving the pool. \[SwapEvent\]
   *
   *  Event parameters: [SwapEvent<<T as frame_system::Config>::AccountId, BalanceOf<T>>, ]
   */
  export class SwapExactAmountOutEvent {
    public readonly expectedParamTypes = [
      "SwapEvent<<T as frame_system::Config>::AccountId, BalanceOf<T>>",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [SwapEvent] {
      return [
        createTypeUnsafe<SwapEvent & Codec>(typeRegistry, "SwapEvent", [
          this.ctx.params[0].value,
        ]),
      ];
    }

    validateParams(): boolean {
      if (this.expectedParamTypes.length !== this.ctx.params.length) {
        return false;
      }
      let valid = true;
      this.expectedParamTypes.forEach((type, i) => {
        if (type !== this.ctx.params[i].type) {
          valid = false;
        }
      });
      return valid;
    }
  }
}
