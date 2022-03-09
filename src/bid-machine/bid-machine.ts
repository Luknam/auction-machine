import { assign, createMachine } from "xstate";

export type Context = {};

export type BidDetails = {
  currentBid: number;
  bidPosition: number;
  totalBidPosition: number;
  status: boolean;
};

export type Services = typeof services;
export const services = {
  getBidDetail: async (context: Context): Promise<BidDetails> => {
    // TODO: Call contract to increase bid
    const test = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          currentBid: 1,
          bidPosition: 10,
          totalBidPosition: 5,
          status: true,
        });
      }, 0);
    });
    return test as Promise<BidDetails>;
  },
  increaseBid: async (context: Context) => {
    // TODO: Call contract to increase bid
    const test = new Promise((resolve) => {
      setTimeout(() => {
        resolve("Hello world");
      }, 5000);
    });
    return test as Promise<string>;
  },
  refundBid: async (context: Context) => {
    // TODO: Call refund bid

    const test = new Promise((resolve) => {
      setTimeout(() => {
        resolve("Hello world");
      }, 5000);
    });
    return test as Promise<string>;
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
          minBid: number;
        },
        events: {} as
          | {
              type: "BID.GET_DETAILS";
              currentBid: number;
              bidPosition: number;
              isInMoney: boolean;
            }
          | { type: "BID.UPDATE_DETAILS" }
          | { type: "BID.UPDATE_INCREASE_BID_VALUE"; newBidValue: number }
          | { type: "BID.INCREASE_BID" }
          | { type: "BID.BID_POSITON_CHANGE"; position: number }
          | { type: "BID.REFUND" },
      },

      on: {
        "BID.BID_POSITON_CHANGE": {
          actions: "updateCurrentBidPostion",
          target: "ValidateBidState",
        },
      },
      context: {
        bidId: "",
        currentBidValue: 0.0,
        increaseBidValue: 0,
        currency: "Eth",
        currentBidPosition: 9,
        totalBidPosition: 100,
        minBid: 0.1,
      },
      states: {
        Loading: {
          invoke: {
            id: "get-bid-detail",
            src: "getBidDetail",
            onDone: {
              target: "ValidateBidState",
              actions: "updateBidDetails",
            },
          },
        },
        ValidateBidState: {
          always: [
            {
              target: "InMoney",
              cond: "isInMoney",
            },
            { target: "OutOfMoney" },
          ],
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
        updateBidDetails: assign((context, event) => {
          const data = event.data as BidDetails;
          return {
            ...context,
            currentBidValue: 0.1,
            currentBidPosition: data.bidPosition,
            totalBidPosition: data.totalBidPosition,
          };
        }),
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
          return context.currentBidPosition < context.totalBidPosition;
        },
      },
    }
  );
