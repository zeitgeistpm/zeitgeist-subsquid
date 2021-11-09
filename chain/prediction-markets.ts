import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import { Market, MarketIdOf } from "@zeitgeistpm/types/dist/interfaces";
import { AccountId } from "@polkadot/types/interfaces";

export namespace PredictionMarkets {
  /**
   *  A market has been created \[market_id, creator\]
   *
   *  Event parameters: [MarketIdOf<T>, Market<T::AccountId, T::BlockNumber, MomentOf<T>>, <T as frame_system::Config>::AccountId, ]
   */
  export class MarketCreatedEvent {
    public readonly expectedParamTypes = [
      "MarketIdOf<T>",
      "Market<T::AccountId, T::BlockNumber, MomentOf<T>>",
      "<T as frame_system::Config>::AccountId",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, Market, AccountId] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<Market & Codec>(typeRegistry, "Market", [
          this.ctx.params[1].value,
        ]),
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
          this.ctx.params[2].value,
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
