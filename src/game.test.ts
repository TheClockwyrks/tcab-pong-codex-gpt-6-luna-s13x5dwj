import { afterEach, describe, expect, it } from "vitest";
import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { game } from "./game";
import { FIELD_CY, FIELD_W, HOLD_TIME } from "./constants";

const engines: ReturnType<typeof createEngine>[] = [];
async function setup() {
  const events = new EventTarget();
  const engine = createEngine({
    canvas: createCanvas(FIELD_W, 720) as unknown as HTMLCanvasElement,
    width: FIELD_W,
    height: 720,
    game,
    clock: new ConstantClock(10),
    surface: {
      cssWidth: () => FIELD_W,
      cssHeight: () => 720,
      dpr: () => 1,
      events: () => events,
    },
  });
  engines.push(engine);
  await engine.initialize();
  return engine;
}
afterEach(() => {
  engines.splice(0).forEach((e) => e.destroy());
});

describe("Carom simulation", () => {
  it("initializes the complete title state and exposes poses", async () => {
    const e = await setup();
    const snap = e.debug.snapshot(e.state);
    expect(snap.screen).toBe("title");
    expect(snap.ball?.held).toBe(true);
    expect(snap.obstacles).toHaveLength(2);
    e.apply((s) => e.debug.setScore(s, 3, 4));
    expect(e.debug.snapshot(e.state).score).toEqual({ p1: 3, p2: 4 });
  });
  it("serves when the hold timer expires, then advances the ball and trail", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "countdown"));
    e.apply((s) => e.debug.setBallHoldTimer(s, 0.01));
    await e.advance(1);
    const snap = e.debug.snapshot(e.state);
    expect(snap.screen).toBe("playing");
    expect(snap.ball?.held).toBe(false);
    expect(snap.ball?.speed).toBeGreaterThan(500);
    await e.advance(2);
    expect(e.debug.snapshot(e.state).ball?.trail.length).toBeGreaterThan(0);
  });
  it("integrates a driven paddle and leaves the source state unchanged", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setPaddleDriven(s, "left", true));
    e.apply((s) => e.debug.setPaddleVy(s, "left", 100));
    e.apply((s) => e.debug.setScreen(s, "countdown"));
    const before = e.state.paddles.left.cy;
    await e.advance(10);
    expect(e.state.paddles.left.cy).toBeCloseTo(before + 10);
    expect(e.state.paddles.left.vy).toBe(100);
    expect(FIELD_CY).toBe(360);
  });
  it("scores a ball past the goal and parks it for the next serve", async () => {
    const e = await setup();
    e.apply((s) => e.debug.setScreen(s, "playing"));
    e.apply((s) => e.debug.setBallHeld(s, false));
    e.apply((s) => e.debug.setBallPosition(s, FIELD_W + 12, 300));
    e.apply((s) => e.debug.setBallVelocity(s, 500, 0));
    await e.advance(1);
    expect(e.debug.snapshot(e.state).score.p1).toBe(1);
    expect(e.state.screen).toBe("countdown");
    expect(e.state.ball?.holdTimer).toBe(HOLD_TIME);
  });
});
