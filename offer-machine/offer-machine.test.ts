import { createOfferMachine, services } from "./offer-machine";

const offerMachine = createOfferMachine(services);
test('should reach "selected" given "idle" when the "SELECT" event accours', () => {
  const expectedValue = "Offerable";

  const acutalState = offerMachine.transition("UnOfferable", {
    type: "OFFER.ADD_OFFER_DETAIL",
    offerQuantity: 0,
    offerValue: 1,
  });
  expect(acutalState.matches(expectedValue)).toBe(true);
});

test('should reach "UnOfferable" given "UnOfferable" when the "OFFER" less not pass condition event accours', () => {
  const expectedValue = "UnOfferable";
  const newMachine = offerMachine.withContext({
    minimumOfferValue: 2,
    maximumOfferQuantity: 2,
    offerQuantity: 0,
    offerValue: 0,
  });
  const acutalState = newMachine.transition("UnOfferable", {
    type: "OFFER.ADD_OFFER_DETAIL",
    offerQuantity: 0,
    offerValue: 0,
  });
  expect(acutalState.matches(expectedValue)).toBe(true);
});

test('should reach "UnOfferable" given "Offerable" when the "OFFER" less not pass condition event accours', () => {
  const expectedValue = "UnOfferable";
  const newMachine = offerMachine.withContext({
    minimumOfferValue: 2,
    maximumOfferQuantity: 2,
    offerQuantity: 0,
    offerValue: 0,
  });
  const acutalState = newMachine.transition("Offerable", {
    type: "OFFER.ADD_OFFER_DETAIL",
    offerQuantity: 0,
    offerValue: 0,
  });
  expect(acutalState.matches(expectedValue)).toBe(true);
});

test('should reach "MakeOffer" given "Offerable" when the "MAKE_OFFERED" event accours', () => {
  const expectedValue = "MakeOffer";

  const acutalState = offerMachine.transition("Offerable", {
    type: "OFFER.MAKE_OFFERED",
  });
  expect(acutalState.matches(expectedValue)).toBe(true);
});
