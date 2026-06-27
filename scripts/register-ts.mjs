// Lets standalone scripts import the app's extensionless relative TS modules
// (Next/tsc allow this; Node ESM needs the .ts). Used only by demo/test runners.
import { register } from "node:module";
register("./resolve-ts-hook.mjs", import.meta.url);
