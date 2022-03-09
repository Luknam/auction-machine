import { interpret } from "xstate";
import { BidDetails, Context, createBidMachine, services } from "./bid-machine";

const defaultBidMachine = createBidMachine(services);

describe('test change state from "Loading" when "GET_DETAILS" event occure ', () => {
  const services = {
    getBidDetail: async (_: Context): Promise<BidDetails> => {
      const test = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            currentBid: 1,
            bidPosition: 1,
            totalBidPosition: 10,
            status: true,
          });
        }, 0);
      });
      return test as Promise<BidDetails>;
    },
    increaseBid: async (_: Context) => "Ok",
    refundBid: async (_: Context) => "Ok",
  };

  const bidMachine = createBidMachine(services);
  test('should reach "InMoney" given "Loading" when getDeatils get bid with position less than total position', (done) => {
    const expectedValue = "InMoney";

    const machine = interpret(bidMachine).onTransition((state) => {
      if (state.matches(expectedValue)) {
        expect(state.context.currentBidPosition).toEqual(1);
        expect(state.context.currentBidValue).toEqual(1);
        expect(state.context.totalBidPosition).toEqual(10);
        done();
      }
    });

    machine.start();
  });

  const faileServices = {
    getBidDetail: async (_: Context): Promise<BidDetails> => {
      const test = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            currentBid: 999,
            bidPosition: 11,
            totalBidPosition: 1,
            status: true,
          });
        }, 0);
      });
      return test as Promise<BidDetails>;
    },
    increaseBid: async (_: Context) => "Ok",
    refundBid: async (_: Context) => "Ok",
  };

  const faileBidMachine = createBidMachine(faileServices);
  test('should reach "OutOfMoney" given "Loading" when getDeatils get bid with position less than total position', (done) => {
    const expectedValue = "OutOfMoney";

    const machine = interpret(faileBidMachine).onTransition((state) => {
      if (state.matches(expectedValue)) {
        expect(state.context.currentBidPosition).toEqual(11);
        expect(state.context.currentBidValue).toEqual(999);
        expect(state.context.totalBidPosition).toEqual(1);
        done();
      }
    });

    machine.start();
  });
});

describe("test event UPDATE_INCREASE_BID_VALUE with valid position ", () => {
  test('should reach "InMoney" given "OutOfMoney" when event accours', () => {
    const testMachine = defaultBidMachine.withContext({
      bidId: "",
      currentBidValue: 0.0,
      increaseBidValue: 0,
      currency: "Eth",
      currentBidPosition: 10,
      totalBidPosition: 5,
      minBid: 0.1,
    });
    const expectedValue = "InMoney";

    const acutalState = testMachine.transition("OutOfMoney", {
      type: "BID.BID_POSITON_CHANGE",
      position: 1,
    });

    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });

  test('should reach "InMoney" given "InMoney" when event accours', () => {
    const testMachine = defaultBidMachine.withContext({
      bidId: "",
      currentBidValue: 0.0,
      increaseBidValue: 0,
      currency: "Eth",
      currentBidPosition: 2,
      totalBidPosition: 5,
      minBid: 0.1,
    });
    const expectedValue = "InMoney";

    const acutalState = testMachine.transition("InMoney", {
      type: "BID.BID_POSITON_CHANGE",
      position: 1,
    });

    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });
});

describe("test event UPDATE_INCREASE_BID_VALUE with invalid position ", () => {
  test('should reach "OutOfMoney" given "OutOfMoney" when event accours', () => {
    const testMachine = defaultBidMachine.withContext({
      bidId: "",
      currentBidValue: 0.0,
      increaseBidValue: 0,
      currency: "Eth",
      currentBidPosition: 10,
      totalBidPosition: 5,
      minBid: 0.1,
    });
    const expectedValue = "OutOfMoney";

    const acutalState = testMachine.transition("OutOfMoney", {
      type: "BID.BID_POSITON_CHANGE",
      position: 99,
    });

    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });

  test('should reach "OutOfMoney" given "InMoney" when event accours', () => {
    const testMachine = defaultBidMachine.withContext({
      bidId: "",
      currentBidValue: 0.0,
      increaseBidValue: 0,
      currency: "Eth",
      currentBidPosition: 2,
      totalBidPosition: 5,
      minBid: 0.1,
    });
    const expectedValue = "OutOfMoney";

    const acutalState = testMachine.transition("InMoney", {
      type: "BID.BID_POSITON_CHANGE",
      position: 99,
    });

    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });
});

describe("test Refund", () => {
  test('should reach "Loading" given "OutOfMoney" when event accours', () => {
    const expectedValue = "Refunded";

    const acutalState = defaultBidMachine.transition("OutOfMoney", {
      type: "BID.REFUND",
    });

    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });
});
