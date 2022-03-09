import { inspect } from "@xstate/inspect";
import { interpret } from "xstate";
import {
  createBidMachine,
  services as bidServices,
} from "./bid-machine/bid-machine";
// import { registerActor, sendEvent } from "./actor-registry";
// @ts-ignore
import { Elm } from "./Main.elm";

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const elmApp = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {},
});

// Use with Main in bid-machine
const machine = interpret(createBidMachine(bidServices), { devTools: true });

// Use with Main in offer-machine
// const machine = interpret(createOfferMachine(services), { devTools: true });

machine.onTransition((state) => {
  elmApp.ports.stateChanged.send(state);
});

elmApp.ports.event.subscribe((event) => {
  machine.send(event);
});

machine.start();
