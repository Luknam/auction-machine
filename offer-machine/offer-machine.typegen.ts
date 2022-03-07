// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateMinimumOfferValue: "OFFER.LOWEST_BID_CHANGED";
    clearOfferValue: "OFFER.CLEAR_OFFER";
    addOfferDetails: "OFFER.ADD_OFFER_DETAIL";
  };
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
    "done.invoke.make-offer": {
      type: "done.invoke.make-offer";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "error.platform.make-offer": {
      type: "error.platform.make-offer";
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    makeOffer: "done.invoke.make-offer";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    makeOffer: "OFFER.MAKE_OFFERED";
  };
  eventsCausingGuards: {
    isOfferable: "OFFER.ADD_OFFER_DETAIL";
  };
  eventsCausingDelays: {};
  matchesStates: "UnOfferable" | "Offerable" | "MakeOffer" | "DisplayResult";
  tags: never;
}
