import { assign, createMachine } from "xstate";

export type Context = {};

export type Services = typeof services;
export const services = {
  getBidDetail: async (context: Context) => {
    // TODO: Call contract to increase bid
    return "Ok";
  },
  increaseBid: async (context: Context) => {
    // TODO: Call contract to increase bid
    return "Ok";
  },
  refundBid: async (context: Context) => {
    // TODO: Call refund bid
    return "Ok";
  },
};

export const createBidMachine = (services: Services) =>
  createMachine(
    {
      id: "BID",
      initial: "Loading",
      tsTypes: {} as import("./bid-machine.typegen").Typegen0,
      schema: {
        context: {} as {
          bidId: string;
          currentBidValue: number;
          increaseBidValue: number;
          currency: string;
          currentBidPosition: number;
          totalBidPosition: number;
          isInMoney: boolean;
          minBid: number;
          error: string;
        },
        events: {} as
          | { type: "BID.UPDATE_DETAILS" }
          | { type: "BID.UPDATE_INCREASE_BID_VALUE"; newBidValue: number }
          | { type: "BID.INCREASE_BID" }
          | { type: "BID.CLEAR_INCREASE_VALUE" }
          | { type: "BID.BID_POSITON_CHANGE"; position: number }
          | { type: "BID.REFUND" },
      },

      on: {
        "BID.BID_POSITON_CHANGE": {
          actions: "updateCurrentBidPostion",
          target: "DisplayBid",
        },
      },
      states: {
        Loading: {
          invoke: {
            id: "get-bid-detail",
            src: "getBidDetail",
            onDone: {
              target: "DisplayBid",
            },
          },
        },
        DisplayBid: {
          on: {
            "BID.UPDATE_DETAILS": [
              {
                target: "InMoney",
                cond: "isInMoney",
              },
              { target: "OutOfMoney" },
            ],
          },
        },
        InMoney: {
          on: {
            "BID.UPDATE_INCREASE_BID_VALUE": {
              target: "InMoney",
              actions: "updateIncreaseBidValue",
            },
            "BID.INCREASE_BID": {
              target: "IncreaseBid",
            },
          },
        },
        OutOfMoney: {
          on: {
            "BID.UPDATE_INCREASE_BID_VALUE": {
              target: "OutOfMoney",
              actions: "updateIncreaseBidValue",
            },
            "BID.INCREASE_BID": {
              target: "IncreaseBid",
            },
            "BID.REFUND": {
              target: "Refunded",
            },
          },
        },
        IncreaseBid: {
          invoke: {
            id: "increase-bid",
            src: "increaseBid",
            onDone: {
              target: "Loading",
            },
            onError: {
              target: "Loading",
            },
          },
        },
        Refunded: {
          invoke: {
            id: "refund-bid",
            src: "refundBid",
            onDone: {
              target: "Loading",
            },
          },
        },
      },
    },
    {
      services,
      actions: {
        updateIncreaseBidValue: assign((context, event) => {
          return {
            ...context,
            increaseBidValue: event.newBidValue,
          };
        }),
        updateCurrentBidPostion: assign((context, event) => {
          return {
            ...context,
            currentBidPosition: event.position,
          };
        }),
      },
      guards: {
        isInMoney: (context, event) => {
          return context.isInMoney;
        },
      },
    }
  );
