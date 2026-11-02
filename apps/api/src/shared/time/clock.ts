/** The current time. Inject it with `@Inject(CLOCK)` instead of calling `new Date()`, so tests can fix the time. */
export type Clock = Readonly<{ now: () => Date }>;
export const CLOCK = Symbol("Clock");

export const systemClock: Clock = { now: () => new Date() };
