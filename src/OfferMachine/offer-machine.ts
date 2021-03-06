import { assign, createMachine } from "xstate";

export type Context = {
  minimumOfferValue: number;
  maximumOfferQuantity: number;
  offerQuantity: number;
  offerValue: number;
};

export const services = {
  makeOffer: async (context: Context): Promise<string> => {
    const { offerQuantity, offerValue } = context;

    //TODO: Call api make offer

    const test = new Promise((resolve) => {
      setTimeout(() => {
        resolve("Hello world");
      }, 5000);
    });
    return test as Promise<string>;
  },
  clearOfferValue: async (context: Context) => {
    return {};
  },
};

type Services = typeof services;
export const createOfferMachine = (services: Services) =>
  createMachine(
    {
      on: {
        "OFFER.LOWEST_BID_CHANGED": {
          target: "Recheck",
          actions: "updateMinimumOfferValue",
        },
      },
      tsTypes: {} as import("./offer-machine.typegen").Typegen0,
      id: "OFFER",
      schema: {
        context: {} as {
          minimumOfferValue: number;
          maximumOfferQuantity: number;
          offerQuantity: number;
          offerValue: number;
        },
        events: {} as
          | {
              type: "OFFER.ADD_OFFER_DETAIL";
              offerQuantity: number;
              offerValue: number;
            }
          | { type: "OFFER.MAKE_OFFERED" }
          | { type: "OFFER.LOWEST_BID_CHANGED"; minimumOfferValue: number }
          | { type: "OFFER.CLEAR_OFFER" },
        services: {} as {
          makeOffer: { data: string };
          clearOfferValue: { data: any };
        },
      },
      initial: "UnOfferable",
      context: {
        minimumOfferValue: 0,
        maximumOfferQuantity: 0,
        offerQuantity: 0,
        offerValue: 0,
      },
      states: {
        Recheck: {
          always: [
            {
              target: "Offerable",
              cond: "recheckIsOfferable",
            },
            { target: "UnOfferable" },
          ],
        },
        UnOfferable: {
          on: {
            "OFFER.ADD_OFFER_DETAIL": [
              {
                target: "Offerable",
                cond: "isOfferable",
                actions: "addOfferDetails",
              },
              { target: "UnOfferable", actions: "addOfferDetails" },
            ],
          },
        },
        Offerable: {
          on: {
            "OFFER.ADD_OFFER_DETAIL": [
              {
                target: "Offerable",
                cond: "isOfferable",
                actions: "addOfferDetails",
              },
              { target: "UnOfferable", actions: "addOfferDetails" },
            ],
            "OFFER.MAKE_OFFERED": {
              target: "MakeOffer",
            },
          },
        },
        MakeOffer: {
          invoke: {
            id: "make-offer",
            src: "makeOffer",
            onDone: {
              target: "DisplayResult",
            },
            onError: {
              target: "DisplayResult",
            },
          },
        },
        DisplayResult: {
          invoke: {
            id: "clear-offer-value",
            src: "clearOfferValue",
            onDone: {
              target: "UnOfferable",
              actions: "clearOfferValue",
            },
          },
        },
      },
    },
    {
      services,
      actions: {
        addOfferDetails: assign((context, event) => {
          return {
            ...context,
            offerQuantity: event.offerQuantity,
            offerValue: event.offerValue,
          };
        }),
        clearOfferValue: assign((context, event) => {
          return {
            ...context,
            offerQuantity: 0,
            offerValue: 0,
          };
        }),
        updateMinimumOfferValue: assign((context, event) => {
          return {
            ...context,
            minimumOfferValue: event.minimumOfferValue,
          };
        }),
      },
      guards: {
        isOfferable: (context, event) => {
          const result =
            event.offerQuantity <= context.maximumOfferQuantity &&
            event.offerValue >= context.minimumOfferValue;
          return result;
        },
        recheckIsOfferable: (context, event) => {
          const result =
            context.offerQuantity <= context.maximumOfferQuantity &&
            context.offerValue >= context.minimumOfferValue;
          return result;
        },
      },
    }
  );
