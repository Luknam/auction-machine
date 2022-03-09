// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateMinimumOfferValue: "OFFER.LOWEST_BID_CHANGED";
    addOfferDetails: "OFFER.ADD_OFFER_DETAIL";
    clearOfferValue: "done.invoke.clear-offer-value";
  };
  internalEvents: {
    "done.invoke.clear-offer-value": {
      type: "done.invoke.clear-offer-value";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.make-offer": {
      type: "done.invoke.make-offer";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.make-offer": {
      type: "error.platform.make-offer";
      data: unknown;
    };
    "": { type: "" };
    "xstate.init": { type: "xstate.init" };
    "error.platform.clear-offer-value": {
      type: "error.platform.clear-offer-value";
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    makeOffer: "done.invoke.make-offer";
    clearOfferValue: "done.invoke.clear-offer-value";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    makeOffer: "OFFER.MAKE_OFFERED";
    clearOfferValue: "done.invoke.make-offer" | "error.platform.make-offer";
  };
  eventsCausingGuards: {
    recheckIsOfferable: "";
    isOfferable: "OFFER.ADD_OFFER_DETAIL";
  };
  eventsCausingDelays: {};
  matchesStates:
    | "Recheck"
    | "UnOfferable"
    | "Offerable"
    | "MakeOffer"
    | "DisplayResult";
  tags: never;
}
