import { inspect } from "@xstate/inspect";
import { interpret } from "xstate";
// import { registerActor, sendEvent } from "./actor-registry";
// @ts-ignore
import { Elm } from "./Main.elm";
import { createOfferMachine, services } from "./offer-machine/offer-machine";

// import { createRedditMachine } from "./reddit-machine";
// import { createSubredditMachine } from "./subreddit-matchine";

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const elmApp = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {},
});

const machine = interpret(createOfferMachine(services), { devTools: true });
machine.onTransition((state) => {
  elmApp.ports.stateChanged.send(state);
});

elmApp.ports.event.subscribe((event) => {
  machine.send(event);
});

machine.start();
