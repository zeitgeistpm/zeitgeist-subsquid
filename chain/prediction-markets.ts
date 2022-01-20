import { createTypeUnsafe } from "@polkadot/types/create";
import { SubstrateEvent, SubstrateExtrinsic } from "@subsquid/hydra-common";
import { Codec } from "@polkadot/types/types";
import { typeRegistry } from ".";

import {
  Market,
  MarketDispute,
  MarketIdOf,
  MarketStatus,
  Report,
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
   export class MarketApprovedEventV1 {
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
   *  A market has been approved \[market_id, new_market_status\]
   *
   *  Event parameters: [MarketIdOf<T>, MarketStatus, ]
   */
  export class MarketApprovedEventV2 {
    public readonly expectedParamTypes = ["MarketIdOf<T>", "MarketStatus"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, MarketStatus] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        (createTypeUnsafe<MarketStatus & Codec>(typeRegistry, "MarketStatus", [
          this.ctx.params[1].value,
        ]) as any) as MarketStatus,
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
   export class MarketCreatedEventV1 {
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
        (createTypeUnsafe<Market & Codec>(typeRegistry, "Market", [
          this.ctx.params[1].value,
        ]) as any) as Market,
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
   *  A market has been created \[market_id, creator\]
   *
   *  Event parameters: [MarketIdOf<T>, Market<T::AccountId, T::BlockNumber, MomentOf<T>>, ]
   */
  export class MarketCreatedEventV2 {
    public readonly expectedParamTypes = [
      "MarketIdOf<T>",
      "Market<T::AccountId, T::BlockNumber, MomentOf<T>>",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, Market] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        (createTypeUnsafe<Market & Codec>(typeRegistry, "Market", [
          this.ctx.params[1].value,
        ]) as any) as Market,
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
   export class MarketStartedWithSubsidyEventV1 {
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
   *  A market was started after gathering enough subsidy. \[market_id, new_market_status\]
   *
   *  Event parameters: [MarketIdOf<T>, MarketStatus, ]
   */
  export class MarketStartedWithSubsidyEventV2 {
    public readonly expectedParamTypes = ["MarketIdOf<T>", "MarketStatus"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, MarketStatus] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        (createTypeUnsafe<MarketStatus & Codec>(typeRegistry, "MarketStatus", [
          this.ctx.params[1].value,
        ]) as any) as MarketStatus,
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
   export class MarketInsufficientSubsidyEventV1 {
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
   *  A market was discarded after failing to gather enough subsidy. \[market_id, new_market_status\]
   *
   *  Event parameters: [MarketIdOf<T>, MarketStatus, ]
   */
  export class MarketInsufficientSubsidyEventV2 {
    public readonly expectedParamTypes = ["MarketIdOf<T>", "MarketStatus"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, MarketStatus] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        (createTypeUnsafe<MarketStatus & Codec>(typeRegistry, "MarketStatus", [
          this.ctx.params[1].value,
        ]) as any) as MarketStatus,
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
   export class MarketDisputedEventV1 {
    public readonly expectedParamTypes = ["MarketIdOf<T>", "OutcomeReport"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, OutcomeReport] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        (createTypeUnsafe<OutcomeReport & Codec>(typeRegistry, "OutcomeReport", [
          this.ctx.params[1].value,
        ]) as any) as OutcomeReport,
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
   *  A market has been disputed \[market_id, new_market_status, new_outcome\]
   *
   *  Event parameters: [MarketIdOf<T>, MarketStatus, MarketDispute<T::AccountId, T::BlockNumber>, ]
   */
  export class MarketDisputedEventV2 {
    public readonly expectedParamTypes = [
      "MarketIdOf<T>",
      "MarketStatus",
      "MarketDispute<T::AccountId, T::BlockNumber>",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, MarketStatus, MarketDispute] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        (createTypeUnsafe<MarketStatus & Codec>(typeRegistry, "MarketStatus", [
          this.ctx.params[1].value,
        ]) as any) as MarketStatus,
        (createTypeUnsafe<MarketDispute & Codec>(typeRegistry, "MarketDispute", [
          this.ctx.params[2].value,
        ]) as any) as MarketDispute,
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
   *  A pending market has been rejected as invalid. \[market_id\]
   *
   *  Event parameters: [MarketIdOf<T>, ]
   */
  export class MarketRejectedEvent {
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
   *  A market has been reported on \[market_id, reported_outcome\]
   *
   *  Event parameters: [MarketIdOf<T>, OutcomeReport, ]
   */
   export class MarketReportedEventV1 {
    public readonly expectedParamTypes = ["MarketIdOf<T>", "OutcomeReport"];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, OutcomeReport] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        (createTypeUnsafe<OutcomeReport & Codec>(typeRegistry, "OutcomeReport", [
          this.ctx.params[1].value,
        ]) as any) as OutcomeReport,
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
   *  A market has been reported on \[market_id, new_market_status, reported_outcome\]
   *
   *  Event parameters: [MarketIdOf<T>, MarketStatus, Report<T::AccountId, T::BlockNumber>, ]
   */
  export class MarketReportedEventV2 {
    public readonly expectedParamTypes = [
      "MarketIdOf<T>",
      "MarketStatus",
      "Report<T::AccountId, T::BlockNumber>",
    ];

    constructor(public readonly ctx: SubstrateEvent) {}

    get params(): [MarketIdOf, MarketStatus, Report] {
      return [
        createTypeUnsafe<MarketIdOf & Codec>(typeRegistry, "MarketIdOf", [
          this.ctx.params[0].value,
        ]),
        (createTypeUnsafe<MarketStatus & Codec>(typeRegistry, "MarketStatus", [
          this.ctx.params[1].value,
        ]) as any) as MarketStatus,
        (createTypeUnsafe<Report & Codec>(typeRegistry, "Report", [
          this.ctx.params[2].value,
        ]) as any) as Report,
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
   *  A pending market has been cancelled. \[market_id\]
   *
   *  Event parameters: [MarketIdOf<T>, ]
   */
  export class MarketCancelledEvent {
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
   *  A complete set of shares has been sold \[market_id, seller\]
   *
   *  Event parameters: [MarketIdOf<T>, <T as frame_system::Config>::AccountId, ]
   */
  export class SoldCompleteSetEvent {
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
}
