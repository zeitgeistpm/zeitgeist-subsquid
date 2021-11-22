import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import { CurrencyId } from "@zeitgeistpm/types/dist/interfaces";
import { AccountId, Balance } from "@polkadot/types/interfaces";

export namespace Tokens {
  /**
   *  An account was created with some free balance. \[currency_id,
   *  account, free_balance\]
   *
   *  Event parameters: [CurrencyId, AccountId, Balance, ]
   */
  export class EndowedEvent {
    public readonly expectedParamTypes = ["CurrencyId", "AccountId", "Balance"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [CurrencyId, AccountId, Balance] {
      return [
        createTypeUnsafe<CurrencyId & Codec>(typeRegistry, "CurrencyId", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
          this.ctx.params[1].value,
        ]),
        createTypeUnsafe<Balance & Codec>(typeRegistry, "Balance", [
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
