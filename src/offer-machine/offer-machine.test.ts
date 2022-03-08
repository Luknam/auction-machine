import { interpret } from "xstate";
import { createOfferMachine, services } from "./offer-machine";

const offerMachine = createOfferMachine(services);
describe("test event ADD_OFFER_DETAIL with offerable value", () => {
  let testMachine;
  beforeAll(() => {
    testMachine = offerMachine.withContext({
      minimumOfferValue: 1,
      maximumOfferQuantity: 2,
      offerQuantity: 0,
      offerValue: 0,
    });
  });

  test('should reach "Offerable" given "UnOfferable" when event accours', () => {
    const expectedValue = "Offerable";

    const acutalState = testMachine.transition("UnOfferable", {
      type: "OFFER.ADD_OFFER_DETAIL",
      offerQuantity: 1,
      offerValue: 1,
    });
    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });

  test('should reach "Offerable" given "Offerable" when event accours', () => {
    const expectedValue = "Offerable";

    const acutalState = testMachine.transition("Offerable", {
      type: "OFFER.ADD_OFFER_DETAIL",
      offerQuantity: 1,
      offerValue: 1,
    });

    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });

  test("offerValue in context should update from given event", (done) => {
    // @ts-ignore
    const offer = interpret(testMachine)
      .onTransition((state) => {
        if (state.matches("Offerable")) {
          try {
            expect(state.context.offerValue).toEqual(1);
            expect(state.context.offerValue).toEqual(1);
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start("UnOfferable");

    offer.send("OFFER.ADD_OFFER_DETAIL", { offerQuantity: 1, offerValue: 1 });
  });
});

describe("test event ADD_OFFER_DETAIL with unofferable value", () => {
  let testMachine;
  beforeAll(() => {
    testMachine = offerMachine.withContext({
      minimumOfferValue: 2,
      maximumOfferQuantity: 2,
      offerQuantity: 0,
      offerValue: 0,
    });
  });

  test('should reach "UnOfferable" given "UnOfferable" when event accours', () => {
    const expectedValue = "UnOfferable";

    const acutalState = testMachine.transition("UnOfferable", {
      type: "OFFER.ADD_OFFER_DETAIL",
      offerQuantity: 0,
      offerValue: 0,
    });
    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });

  test('should reach "UnOfferable" given "Offerable" when event accours', () => {
    const expectedValue = "UnOfferable";

    const acutalState = testMachine.transition("Offerable", {
      type: "OFFER.ADD_OFFER_DETAIL",
      offerQuantity: 0,
      offerValue: 0,
    });
    expect(acutalState.matches(expectedValue)).toBeTruthy();
  });

  test("offerValue in context should update from given event", (done) => {
    // @ts-ignore
    const offer = interpret(offerMachine)
      .onTransition((state) => {
        if (state.matches("Offerable")) {
          try {
            expect(state.context.offerValue).toEqual(0);
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start("UnOfferable");

    offer.send("OFFER.ADD_OFFER_DETAIL", { offerQuantity: 0, offerValue: 0 });
  });
});

test('should reach "MakeOffer" given "Offerable" when the "MAKE_OFFERED" event accours', () => {
  const expectedValue = "MakeOffer";

  const acutalState = offerMachine.transition("Offerable", {
    type: "OFFER.MAKE_OFFERED",
  });
  expect(acutalState.matches(expectedValue)).toBeTruthy();
});
