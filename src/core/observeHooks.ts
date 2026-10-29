import { randomUUID } from "node:crypto";

let idFactory: () => string = () => randomUUID();
let clock: () => string = () => new Date().toISOString();

export function setGapuraObserveHooks(hooks: {
  idFactory?: () => string;
  clock?: () => string;
}): void {
  if (hooks.idFactory) idFactory = hooks.idFactory;
  if (hooks.clock) clock = hooks.clock;
}

export function resetGapuraObserveHooks(): void {
  idFactory = () => randomUUID();
  clock = () => new Date().toISOString();
}

export function gapuraObserveId(): string {
  return idFactory();
}

export function gapuraObserveTimestamp(): string {
  return clock();
}
