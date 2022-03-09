// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateCurrentBidPostion: "BID.BID_POSITON_CHANGE";
    updateBidDetails: "done.invoke.get-bid-detail";
    updateIncreaseBidValue: "BID.UPDATE_INCREASE_BID_VALUE";
  };
  internalEvents: {
    "done.invoke.get-bid-detail": {
      type: "done.invoke.get-bid-detail";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.increase-bid": {
      type: "done.invoke.increase-bid";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.increase-bid": {
      type: "error.platform.increase-bid";
      data: unknown;
    };
    "done.invoke.refund-bid": {
      type: "done.invoke.refund-bid";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "": { type: "" };
    "xstate.init": { type: "xstate.init" };
    "error.platform.get-bid-detail": {
      type: "error.platform.get-bid-detail";
      data: unknown;
    };
    "error.platform.refund-bid": {
      type: "error.platform.refund-bid";
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    getBidDetail: "done.invoke.get-bid-detail";
    increaseBid: "done.invoke.increase-bid";
    refundBid: "done.invoke.refund-bid";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    getBidDetail:
      | "done.invoke.increase-bid"
      | "error.platform.increase-bid"
      | "done.invoke.refund-bid";
    increaseBid: "BID.INCREASE_BID";
    refundBid: "BID.REFUND";
  };
  eventsCausingGuards: {
    isInMoney: "";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "Loading"
    | "ValidateBidState"
    | "InMoney"
    | "OutOfMoney"
    | "IncreaseBid"
    | "Refunded";
  tags: never;
}
