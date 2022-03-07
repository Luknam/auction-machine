import { assign, createMachine } from "xstate";

export type Context = {
  minimumOfferValue: number;
  maximumOfferQuantity: number;
  offerQuantity: number;
  offerValue: number;
};

export const services = {
  makeOffer: async (context: Context) => {
    const { offerQuantity, offerValue } = context;

    //TODO: Call api make offer
    // const response = await fetch(`https://www.reddit.com/r/${subreddit}.json`);
    // const json = await response.json();
    // return json.data.children.map((child: any) => child.data);
    return "Ok";
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
        UnOfferable: {
          on: {
            "OFFER.ADD_OFFER_DETAIL": [
              {
                target: "Offerable",
                cond: "isOfferable",
              },
              { target: "UnOfferable" },
            ],
          },
        },
        Offerable: {
          on: {
            "OFFER.ADD_OFFER_DETAIL": {
              target: "UnOfferable",
              actions: "addOfferDetails",
            },
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
          return (
            context.offerQuantity <= context.maximumOfferQuantity &&
            context.offerValue >= context.minimumOfferValue
          );
        },
      },
    }
  );
