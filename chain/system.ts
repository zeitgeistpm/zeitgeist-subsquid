import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import {
  AccountId,
  DispatchError,
  DispatchInfo,
} from "@polkadot/types/interfaces";

export namespace System {
  /**
   *  A new \[account\] was created.
   *
   *  Event parameters: [AccountId, ]
   */
  export class NewAccountEvent {
    public readonly expectedParamTypes = ["AccountId"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [AccountId] {
      return [
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
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
   *  An extrinsic completed successfully. \[info\]
   *
   *  Event parameters: [DispatchInfo, ]
   */
  export class ExtrinsicSuccessEvent {
    public readonly expectedParamTypes = ["DispatchInfo"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [DispatchInfo] {
      return [
        createTypeUnsafe<DispatchInfo & Codec>(typeRegistry, "DispatchInfo", [
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
   *  An extrinsic failed. \[error, info\]
   *
   *  Event parameters: [DispatchError, DispatchInfo, ]
   */
  export class ExtrinsicFailedEvent {
    public readonly expectedParamTypes = ["DispatchError", "DispatchInfo"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [DispatchError, DispatchInfo] {
      return [
        createTypeUnsafe<DispatchError & Codec>(typeRegistry, "DispatchError", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<DispatchInfo & Codec>(typeRegistry, "DispatchInfo", [
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
}
