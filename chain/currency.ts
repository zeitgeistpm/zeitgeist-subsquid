import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import { CurrencyIdOf } from "@zeitgeistpm/types/dist/interfaces";
import { AccountId, Balance } from "@polkadot/types/interfaces";

export namespace Currency {
  /**
   *  Currency transfer success. \[currency_id, from, to, amount\]
   *
   *  Event parameters: [Currency, AccountId, AccountId, Balance, ]
   */
  export class TransferredEvent {
    public readonly expectedParamTypes = [
      "CurrencyIdOf",
      "AccountId",
      "AccountId",
      "Balance",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [CurrencyIdOf, AccountId, AccountId, Balance] {
      return [
        createTypeUnsafe<CurrencyIdOf & Codec>(typeRegistry, "CurrencyIdOf", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
          this.ctx.params[1].value,
        ]),
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
          this.ctx.params[2].value,
        ]),
        createTypeUnsafe<Balance & Codec>(typeRegistry, "Balance", [
          this.ctx.params[3].value,
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
