import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import { AccountId, Balance } from "@polkadot/types/interfaces";

export namespace Balances {
  /**
   *  An account was created with some free balance. \[account, free_balance\]
   *
   *  Event parameters: [AccountId, Balance, ]
   */
  export class EndowedEvent {
    public readonly expectedParamTypes = ["AccountId", "Balance"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [AccountId, Balance] {
      return [
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<Balance & Codec>(typeRegistry, "Balance", [
          this.ctx.params[1].value,
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
   *  Transfer succeeded. \[from, to, value\]
   *
   *  Event parameters: [AccountId, AccountId, Balance, ]
   */
  export class TransferEvent {
    public readonly expectedParamTypes = ["AccountId", "AccountId", "Balance"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [AccountId, AccountId, Balance] {
      return [
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
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

  /**
   *  A balance was set by root. \[who, free, reserved\]
   *
   *  Event parameters: [AccountId, Balance, Balance, ]
   */
  export class BalanceSetEvent {
    public readonly expectedParamTypes = ["AccountId", "Balance", "Balance"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [AccountId, Balance, Balance] {
      return [
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<Balance & Codec>(typeRegistry, "Balance", [
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
