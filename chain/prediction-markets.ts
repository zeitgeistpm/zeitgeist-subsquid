import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import {
  Market,
  MarketIdOf,
  OutcomeReport,
} from "@zeitgeistpm/types/dist/interfaces";
import { AccountId } from "@polkadot/types/interfaces";

export namespace PredictionMarkets {
  /**
   *  A complete set of shares has been bought \[market_id, buyer\]
   *
   *  Event parameters: [MarketIdOf<T>, <T as frame_system::Config>::AccountId, ]
   */
  export class BoughtCompleteSetEvent {
    public readonly expectedParamTypes = [
      "MarketIdOf<T>",
      "<T as frame_system::Config>::AccountId",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, AccountId] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<AccountId & Codec>(typeRegistry, "AccountId", [
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
   *  A market has been approved \[market_id\]
   *
   *  Event parameters: [MarketIdOf<T>, ]
   */
  export class MarketApprovedEvent {
    public readonly expectedParamTypes = ["MarketIdOf<T>"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
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

  /**
   *  A market was started after gathering enough subsidy. \[market_id\]
   *
   *  Event parameters: [MarketIdOf<T>, ]
   */
  export class MarketStartedWithSubsidyEvent {
    public readonly expectedParamTypes = ["MarketIdOf<T>"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
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
   * A market was discarded after failing to gather enough subsidy. \[market_id\]
   *
   *  Event parameters: [MarketIdOf<T>, ]
   */
  export class MarketInsufficientSubsidyEvent {
    public readonly expectedParamTypes = ["MarketIdOf<T>"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
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
   *  A market has been disputed \[market_id, new_outcome\]
   *
   *  Event parameters: [MarketIdOf<T>, OutcomeReport, ]
   */
  export class MarketDisputedEvent {
    public readonly expectedParamTypes = ["MarketIdOf<T>", "OutcomeReport"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, OutcomeReport] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<OutcomeReport & Codec>(typeRegistry, "OutcomeReport", [
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
   *  A market has been reported on \[market_id, reported_outcome\]
   *
   *  Event parameters: [MarketIdOf<T>, OutcomeReport, ]
   */
  export class MarketReportedEvent {
    public readonly expectedParamTypes = ["MarketIdOf<T>", "OutcomeReport"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, OutcomeReport] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        createTypeUnsafe<OutcomeReport & Codec>(typeRegistry, "OutcomeReport", [
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
