import type { Game, InitApi, RenderApi } from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import * as C from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";
export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}
export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}
export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}
export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}
export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}
export interface MenuRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export interface CaromSnapshot {
  readonly version: number;
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly muted: boolean;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: (BallState & { readonly speed: number }) | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
}
export interface CaromDebugApi {
  readonly version: number;
  clearWorld(s: DeepReadonly<CaromState>): CaromState;
  spawnBall(s: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(s: DeepReadonly<CaromState>, index: number): CaromState;
  reset(s: DeepReadonly<CaromState>): CaromState;
  reconcile(s: DeepReadonly<CaromState>): CaromState;
  setScreen(s: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(s: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(s: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    s: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(s: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(s: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(s: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(s: DeepReadonly<CaromState>, side: Side, cy: number): CaromState;
  setPaddleVy(s: DeepReadonly<CaromState>, side: Side, vy: number): CaromState;
  setPaddleDriven(
    s: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    s: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    s: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(s: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(s: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(s: DeepReadonly<CaromState>, seconds: number): CaromState;
  setBallServeSign(s: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(s: DeepReadonly<CaromState>): CaromState;
  setAiTracking(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(s: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(s: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(s: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(s: DeepReadonly<CaromState>, index: number): MenuRect | null;
}

export const BACKGROUND = "#071018";
const INK = "#eaf7f4",
  MUTED = "#83a1a5",
  CYAN = "#53f0d0",
  CORAL = "#ff786b",
  GOLD = "#f9cf70",
  PANEL = "rgba(5, 13, 20, .88)";
const randSign = (): 1 | -1 => (Math.random() < 0.5 ? -1 : 1);
const homeBall = (): BallState => ({
  x: C.FIELD_CX,
  y: C.FIELD_CY,
  vx: 0,
  vy: 0,
  spin: 0,
  held: true,
  holdTimer: C.HOLD_TIME,
  serveSign: randSign(),
  trail: [],
});
const paddle = (): PaddleState => ({
  cy: C.FIELD_CY,
  vy: 0,
  driven: false,
  drivenVy: 0,
});
function initial(muted: boolean): CaromState {
  return {
    screen: "title",
    mode: "solo",
    menuIndex: 0,
    titleIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    paddles: { left: paddle(), right: paddle() },
    ai: { tracking: true, movement: true },
    receiver: "left",
    ball: homeBall(),
    obstacles: C.OBSTACLE_CENTERS.map((o, index) => ({
      index,
      cx: o.x,
      cy: o.y,
    })),
    simTime: 0,
    muted,
  };
}
const menuItems = (s: DeepReadonly<CaromState>): readonly string[] =>
  s.screen === "title"
    ? C.TITLE_ITEMS
    : s.screen === "paused"
      ? C.PAUSE_ITEMS
      : s.screen === "matchover"
        ? C.MATCHOVER_ITEMS
        : s.screen === "howto"
          ? ["BACK TO TITLE"]
          : [];
const rectAt = (i: number): MenuRect => ({
  x: 440,
  y: 390 + i * 62,
  w: 400,
  h: 48,
});
const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));
function parkedBall(): BallState {
  return homeBall();
}
function begin(s: DeepReadonly<CaromState>, mode: Mode = s.mode): CaromState {
  return {
    ...s,
    screen: "countdown",
    mode,
    menuIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    receiver: "left",
    ball: parkedBall(),
    paddles: { left: paddle(), right: paddle() },
  };
}
function title(s: DeepReadonly<CaromState>): CaromState {
  const b = parkedBall();
  return {
    ...initial(s.muted),
    titleIndex: s.titleIndex,
    menuIndex: s.titleIndex,
    simTime: s.simTime,
    muted: s.muted,
    ball: b,
  };
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    C.ACTIONS.forEach((name) =>
      api.input.register(name, { keys: [...C.BINDINGS[name]] }),
    );
    api.audio.define(C.CUES.paddleHit, {
      wave: "square",
      freq: 510,
      freqTo: 280,
      gain: 0.12,
      durationMs: 58,
    });
    api.audio.define(C.CUES.wallBounce, {
      wave: "triangle",
      freq: 360,
      freqTo: 220,
      gain: 0.1,
      durationMs: 48,
    });
    api.audio.define(C.CUES.obstacleBounce, {
      wave: "sawtooth",
      freq: 260,
      freqTo: 430,
      gain: 0.11,
      durationMs: 65,
    });
    api.audio.define(C.CUES.score, {
      wave: "sine",
      freq: 660,
      freqTo: 990,
      gain: 0.16,
      durationMs: 180,
    });
    const diag: [
      string,
      (s: DeepReadonly<CaromState>) => string | number | boolean,
    ][] = [
      ["screen", (s) => s.screen],
      ["mode", (s) => s.mode],
      ["score", (s) => `${s.score.p1}-${s.score.p2}`],
      [
        "ball",
        (s) =>
          s.ball ? `${s.ball.x.toFixed(1)},${s.ball.y.toFixed(1)}` : "none",
      ],
      [
        "velocity",
        (s) =>
          s.ball ? `${s.ball.vx.toFixed(1)},${s.ball.vy.toFixed(1)}` : "none",
      ],
      ["speed", (s) => (s.ball ? Math.hypot(s.ball.vx, s.ball.vy) : 0)],
      ["spin", (s) => s.ball?.spin ?? 0],
      [
        "p1",
        (s) =>
          `${s.paddles.left.cy.toFixed(1)} / ${s.paddles.left.vy.toFixed(1)}`,
      ],
      [
        "p2",
        (s) =>
          `${s.paddles.right.cy.toFixed(1)} / ${s.paddles.right.vy.toFixed(1)}`,
      ],
    ];
    diag.forEach(([n, f]) => api.diagnostics.register(n, f));
    return [initial(false), makeDebug()];
  },
  update(state, api, dt): CaromState {
    const pressed = (a: string) => api.input.pressed(a),
      val = (a: string) => api.input.value(a);
    let s: CaromState = { ...state, simTime: state.simTime + dt };
    if (pressed("mute")) {
      api.audio.setMuted(!api.audio.muted());
      s = { ...s, muted: api.audio.muted() };
    }
    const began = state.screen;
    if ((began === "countdown" || began === "playing") && pressed("pause"))
      s = { ...s, resumeScreen: began, screen: "paused", menuIndex: 0 };
    else if (began === "paused" && (pressed("pause") || pressed("back")))
      s = { ...s, screen: s.resumeScreen };
    else if (began === "howto" && (pressed("confirm") || pressed("back")))
      s = title(s);
    else if (began === "matchover" && pressed("back")) s = title(s);
    else if (began === "title" || began === "paused" || began === "matchover") {
      const items = menuItems(s);
      const up = pressed("p1-up") || pressed("p2-up"),
        down = pressed("p1-down") || pressed("p2-down");
      if (began === "title" && (up || down))
        s = {
          ...s,
          menuIndex: (s.menuIndex + (up ? items.length - 1 : 1)) % items.length,
        };
      else if ((began === "paused" || began === "matchover") && (up || down))
        s = {
          ...s,
          menuIndex: (s.menuIndex + (up ? items.length - 1 : 1)) % items.length,
        };
      if (began !== "title" || (!up && !down)) {
        const pointer = api.input.pointer();
        let pointerConfirm = false;
        const samples = api.input.pointerSamples();
        for (let i = 0; i < items.length; i++) {
          const r = rectAt(i);
          if (
            pointer.x >= r.x &&
            pointer.x <= r.x + r.w &&
            pointer.y >= r.y &&
            pointer.y <= r.y + r.h
          )
            s = { ...s, menuIndex: i };
        }
        const downPt = samples.find((p) => p.type === "down"),
          upPt = [...samples].reverse().find((p) => p.type === "up");
        if (downPt && upPt) {
          const hit = (p: { x: number; y: number }) =>
            items.findIndex((_, i) => {
              const r = rectAt(i);
              return (
                p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h
              );
            });
          const a = hit(downPt),
            b = hit(upPt);
          if (a >= 0 && a === b) {
            s = { ...s, menuIndex: a };
            pointerConfirm = true;
          }
        }
        const confirm = pressed("confirm") || pointerConfirm;
        if (confirm) {
          const idx = s.menuIndex;
          if (began === "title") {
            s = { ...s, titleIndex: idx };
            if (idx === 0) s = begin(s, "solo");
            else if (idx === 1) s = begin(s, "versus");
            else s = { ...s, screen: "howto", menuIndex: 0 };
          } else if (began === "paused") {
            if (idx === 0) s = { ...s, screen: s.resumeScreen };
            else if (idx === 1) s = begin(s);
            else s = title(s);
          } else if (began === "matchover") {
            if (idx === 0) s = begin(s);
            else s = title(s);
          } else if (began === "howto") s = title(s);
        }
      }
    }
    if (s.screen !== "playing" && s.screen !== "countdown") return s;
    const move = (side: Side, vy: number): PaddleState => {
      const p = s.paddles[side];
      if (p.driven) vy = p.drivenVy;
      const next = clamp(p.cy + vy * dt, C.PADDLE_MIN_CY, C.PADDLE_MAX_CY);
      return { ...p, cy: next, vy: dt > 0 ? (next - p.cy) / dt : vy };
    };
    const inputVy = (up: string[], down: string[]) =>
      (Math.max(...up.map(val)) - Math.max(...down.map(val))) * C.PADDLE_SPEED;
    const left = move(
      "left",
      s.mode === "solo"
        ? inputVy(["p1-up", "p2-up"], ["p1-down", "p2-down"])
        : inputVy(["p1-up"], ["p1-down"]),
    );
    let rightVy = s.mode === "versus" ? inputVy(["p2-up"], ["p2-down"]) : 0;
    if (s.mode === "solo" && !s.paddles.right.driven && s.ai.movement) {
      let target = C.AI_HOME_Y,
        dead = C.AI_HOME_DEADZONE;
      if (s.screen === "playing" && s.ai.tracking && s.ball && s.ball.vx > 0) {
        target = s.ball.y - s.ball.vy * C.AI_REACT;
        dead = C.AI_DEADZONE;
      }
      const d = target - s.paddles.right.cy;
      rightVy =
        Math.abs(d) <= dead
          ? 0
          : Math.sign(d) *
            Math.min(C.AI_SPEED, Math.abs(d) / Math.max(dt, 1e-9));
    }
    const right = move(
      "right",
      s.paddles.right.driven ? s.paddles.right.drivenVy : rightVy,
    );
    s = { ...s, paddles: { left, right } };
    let b = s.ball;
    if (!b) return s;
    if (s.screen === "countdown") {
      const timer = b.holdTimer - dt;
      if (timer <= 0) {
        const dir = s.receiver === "left" ? -1 : 1;
        b = {
          ...b,
          held: false,
          holdTimer: 0,
          vx: dir * C.SERVE_SPEED * Math.cos(C.SERVE_ANGLE),
          vy: b.serveSign * C.SERVE_SPEED * Math.sin(C.SERVE_ANGLE),
          trail: [],
        };
        s = { ...s, screen: "playing" };
      } else b = { ...b, holdTimer: timer };
    } else if (!b.held) {
      const speed = Math.hypot(b.vx, b.vy),
        n = Math.max(1, Math.ceil((speed * dt) / C.MAX_SUBSTEP)),
        h = dt / n;
      let x = b.x,
        y = b.y,
        vx = b.vx,
        vy = b.vy,
        spin = b.spin;
      const hit = new Set<string>();
      for (let step = 0; step < n; step++) {
        const sp = Math.hypot(vx, vy);
        if (sp > 0) {
          const a = (spin / sp) * h,
            c = Math.cos(a),
            sn = Math.sin(a);
          [vx, vy] = [vx * c - vy * sn, vx * sn + vy * c];
        }
        spin *= Math.pow(0.5, h / C.SPIN_HALFLIFE);
        x += vx * h;
        y += vy * h;
        if (y - C.BALL_R < 0 && vy < 0) {
          y = C.BALL_R;
          vy = -vy;
          hit.add("wall");
        } else if (y + C.BALL_R > C.FIELD_H && vy > 0) {
          y = C.FIELD_H - C.BALL_R;
          vy = -vy;
          hit.add("wall");
        }
        for (const side of ["left", "right"] as const) {
          const p = s.paddles[side],
            x0 = side === "left" ? C.P1_X0 : C.P2_X0,
            x1 = side === "left" ? C.P1_X1 : C.P2_X1;
          const result = collide(
            x,
            y,
            vx,
            vy,
            x0,
            x1,
            p.cy - C.PADDLE_HALF,
            p.cy + C.PADDLE_HALF,
          );
          if (result) {
            ({ x, y, vx, vy } = result);
            if (result.face === "left" || result.face === "right") {
              const dir = side === "left" ? 1 : -1,
                theta =
                  clamp((y - p.cy) / C.PADDLE_HALF, -1, 1) * C.MAX_BOUNCE_ANGLE,
                ns = Math.min(Math.hypot(vx, vy) * C.SPEED_MULT, C.SPEED_CAP);
              vx = dir * ns * Math.cos(theta);
              vy = ns * Math.sin(theta);
              spin = clamp(
                spin + p.vy * C.SPIN_FROM_PADDLE,
                -C.SPIN_CLAMP,
                C.SPIN_CLAMP,
              );
              hit.add("paddle");
            } else {
              if (result.face === "top" || result.face === "bottom")
                hit.add("wall");
            }
          }
        }
        for (const o of s.obstacles) {
          const result = collide(
            x,
            y,
            vx,
            vy,
            o.cx - C.OBSTACLE_HW,
            o.cx + C.OBSTACLE_HW,
            o.cy - C.OBSTACLE_HH,
            o.cy + C.OBSTACLE_HH,
          );
          if (result) {
            ({ x, y, vx, vy } = result);
            hit.add("obstacle");
          }
        }
      }
      hit.forEach((k) =>
        api.audio.play(
          k === "paddle"
            ? C.CUES.paddleHit
            : k === "wall"
              ? C.CUES.wallBounce
              : C.CUES.obstacleBounce,
        ),
      );
      b = { ...b, x, y, vx, vy, spin };
      if (x - C.BALL_R > C.FIELD_W || x + C.BALL_R < 0) {
        const scorer = x - C.BALL_R > C.FIELD_W ? "p1" : "p2",
          p1 = s.score.p1 + (scorer === "p1" ? 1 : 0),
          p2 = s.score.p2 + (scorer === "p2" ? 1 : 0),
          side: Side = scorer === "p1" ? "left" : "right";
        api.audio.play(C.CUES.score);
        if (
          (p1 >= C.WIN_SCORE && p1 - p2 >= C.WIN_LEAD) ||
          (p2 >= C.WIN_SCORE && p2 - p1 >= C.WIN_LEAD)
        )
          return {
            ...s,
            score: { p1, p2 },
            winner: side,
            screen: "matchover",
            menuIndex: 0,
            ball: b,
          };
        s = {
          ...s,
          score: { p1, p2 },
          receiver: scorer === "p1" ? "right" : "left",
          screen: "countdown",
        };
        b = parkedBall();
      }
    }
    if (b) {
      const trail = [...b.trail, { x: b.x, y: b.y, t: s.simTime }].filter(
        (sample) => s.simTime - sample.t <= C.TRAIL_TIME,
      );
      b = { ...b, trail };
    }
    return { ...s, ball: b };
  },
  render(state, api: RenderApi): void {
    draw(state, api);
  },
};

interface Collision {
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: "left" | "right" | "top" | "bottom";
}
function collide(
  x: number,
  y: number,
  vx: number,
  vy: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
): Collision | null {
  const l = x0 - C.BALL_R,
    r = x1 + C.BALL_R,
    t = y0 - C.BALL_R,
    b = y1 + C.BALL_R;
  if (!(x > l && x < r && y > t && y < b)) return null;
  const ds = [x - l, r - x, y - t, b - y],
    face = (["left", "right", "top", "bottom"] as const)[
      ds.indexOf(Math.min(...ds))
    ];
  if (face === "left") {
    x = x0 - C.BALL_R;
    if (vx > 0) vx = -vx;
  } else if (face === "right") {
    x = x1 + C.BALL_R;
    if (vx < 0) vx = -vx;
  } else if (face === "top") {
    y = y0 - C.BALL_R;
    if (vy > 0) vy = -vy;
  } else {
    y = y1 + C.BALL_R;
    if (vy < 0) vy = -vy;
  }
  return { x, y, vx, vy, face };
}

function makeDebug(): CaromDebugApi {
  const need = (s: DeepReadonly<CaromState>): BallState => {
    if (!s.ball) throw new Error("Carom: no ball is present");
    return s.ball as BallState;
  };
  return {
    version: C.CAROM_DEBUG_VERSION,
    clearWorld: (s) => ({ ...s, ball: null, obstacles: [] }),
    spawnBall: (s) => ({ ...s, ball: parkedBall() }),
    spawnObstacle: (s, index) => {
      const o = C.OBSTACLE_CENTERS[index];
      if (!o) throw new Error(`Carom: no obstacle at index ${index}`);
      return {
        ...s,
        obstacles: [
          ...s.obstacles.filter((v) => v.index !== index),
          { index, cx: o.x, cy: o.y },
        ].sort((a, b) => a.index - b.index),
      };
    },
    reset: (s) => initial(s.muted),
    reconcile: (s) => ({ ...s }),
    setScreen: (s, screen) => ({ ...s, screen }),
    setMode: (s, mode) => ({ ...s, mode }),
    setMenuIndex: (s, menuIndex) => ({ ...s, menuIndex }),
    setTitleIndex: (s, titleIndex) => ({ ...s, titleIndex }),
    setResumeScreen: (s, resumeScreen) => ({ ...s, resumeScreen }),
    setScore: (s, p1, p2) => ({ ...s, score: { p1, p2 } }),
    setWinner: (s, winner) => ({ ...s, winner }),
    setReceiver: (s, receiver) => ({ ...s, receiver }),
    setPaddleCy: (s, side, cy) => ({
      ...s,
      paddles: { ...s.paddles, [side]: { ...s.paddles[side], cy } },
    }),
    setPaddleVy: (s, side, drivenVy) => ({
      ...s,
      paddles: { ...s.paddles, [side]: { ...s.paddles[side], drivenVy } },
    }),
    setPaddleDriven: (s, side, driven) => ({
      ...s,
      paddles: { ...s.paddles, [side]: { ...s.paddles[side], driven } },
    }),
    setBallPosition: (s, x, y) => ({ ...s, ball: { ...need(s), x, y } }),
    setBallVelocity: (s, vx, vy) => ({ ...s, ball: { ...need(s), vx, vy } }),
    setBallSpin: (s, spin) => ({ ...s, ball: { ...need(s), spin } }),
    setBallHeld: (s, held) => ({ ...s, ball: { ...need(s), held } }),
    setBallHoldTimer: (s, holdTimer) => ({
      ...s,
      ball: { ...need(s), holdTimer },
    }),
    setBallServeSign: (s, serveSign) => ({
      ...s,
      ball: { ...need(s), serveSign },
    }),
    drawBallServeSign: (s) => ({
      ...s,
      ball: { ...need(s), serveSign: randSign() },
    }),
    setAiTracking: (s, tracking) => ({ ...s, ai: { ...s.ai, tracking } }),
    setAiMovement: (s, movement) => ({ ...s, ai: { ...s.ai, movement } }),
    setMuted: (s, muted) => ({ ...s, muted }),
    snapshot: (s) => ({
      ...s,
      version: C.CAROM_DEBUG_VERSION,
      paddles: { left: { ...s.paddles.left }, right: { ...s.paddles.right } },
      ai: { ...s.ai },
      score: { ...s.score },
      ball: s.ball
        ? { ...s.ball, speed: Math.hypot(s.ball.vx, s.ball.vy) }
        : null,
      obstacles: s.obstacles.map((o) => ({ ...o })),
    }),
    menuItemRect: (s, index) =>
      index >= 0 && index < menuItems(s).length ? rectAt(index) : null,
  };
}

function draw(s: DeepReadonly<CaromState>, api: RenderApi): void {
  const c = api.ctx;
  c.fillStyle = BACKGROUND;
  c.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
  c.save();
  if (
    s.screen === "title" ||
    s.screen === "howto" ||
    s.screen === "paused" ||
    s.screen === "matchover"
  )
    c.globalAlpha = 0.34;
  c.strokeStyle = "rgba(132,178,183,.28)";
  c.setLineDash([10, 14]);
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(C.NET_X, 36);
  c.lineTo(C.NET_X, C.FIELD_H - 36);
  c.stroke();
  c.setLineDash([]);
  s.obstacles.forEach((o) => {
    glow(c, GOLD, 14);
    round(
      c,
      o.cx - C.OBSTACLE_W / 2,
      o.cy - C.OBSTACLE_H / 2,
      C.OBSTACLE_W,
      C.OBSTACLE_H,
      10,
      GOLD,
    );
  });
  (["left", "right"] as const).forEach((side) => {
    const p = s.paddles[side],
      color = side === "left" ? CYAN : CORAL,
      x = side === "left" ? C.P1_X0 : C.P2_X0;
    glow(c, color, 20);
    round(c, x, p.cy - C.PADDLE_HALF, C.PADDLE_W, C.PADDLE_H, 8, color);
  });
  if (s.ball) {
    if (s.ball.trail.length > 1) {
      c.lineCap = "round";
      for (let i = 1; i < s.ball.trail.length; i++) {
        const a = s.ball.trail[i - 1],
          b = s.ball.trail[i];
        c.strokeStyle = `rgba(83,240,208,${0.08 + (0.5 * i) / s.ball.trail.length})`;
        c.lineWidth = 2 + (7 * i) / s.ball.trail.length;
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      }
    }
    glow(c, INK, 20);
    c.fillStyle = INK;
    c.beginPath();
    c.arc(s.ball.x, s.ball.y, C.BALL_R, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
  if (
    s.screen === "playing" ||
    s.screen === "countdown" ||
    s.screen === "paused" ||
    s.screen === "matchover"
  ) {
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "700 56px system-ui";
    c.fillStyle = CYAN;
    c.fillText(String(s.score.p1), C.FIELD_CX - 80, 72);
    c.fillStyle = CORAL;
    c.fillText(String(s.score.p2), C.FIELD_CX + 80, 72);
    c.font = "600 14px system-ui";
    c.letterSpacing = "3px";
    c.fillStyle = MUTED;
    c.fillText(
      s.mode === "solo" ? "SOLO MATCH" : "LOCAL VERSUS",
      C.FIELD_CX,
      124,
    );
  }
  if (s.screen === "title") {
    c.fillStyle = "rgba(4,12,18,.72)";
    c.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
    c.textAlign = "center";
    c.fillStyle = CYAN;
    c.font = "900 104px system-ui";
    c.fillText(C.TITLE_TEXT, 640, 240);
    c.fillStyle = MUTED;
    c.font = "600 17px system-ui";
    c.letterSpacing = "5px";
    c.fillText("SPIN THE ANGLE. OWN THE BANK.", 640, 294);
    drawMenu(c, menuItems(s), s.menuIndex);
    c.font = "14px system-ui";
    c.fillStyle = MUTED;
    c.letterSpacing = "1px";
    c.fillText(
      "W / S  OR  ↑ / ↓   SELECT     ·     ENTER   PLAY     ·     M   SOUND",
      640,
      662,
    );
  }
  if (s.screen === "howto") {
    overlay(c);
    panel(c);
    c.textAlign = "center";
    c.fillStyle = CYAN;
    c.font = "800 50px system-ui";
    c.fillText("HOW TO PLAY", 640, 130);
    c.fillStyle = INK;
    c.font = "22px system-ui";
    [
      "W / S moves left paddle · ↑ / ↓ moves right paddle",
      "Move as you strike to add spin and bend the flight.",
      "Bank shots off the gold obstacles to break a defense.",
      "First to 11, win by 2. Solo faces the reactive AI.",
    ].forEach((t, i) => c.fillText(t, 640, 250 + i * 48));
    drawMenu(c, ["BACK TO TITLE"], 0);
  }
  if (s.screen === "countdown") {
    c.textAlign = "center";
    c.fillStyle = INK;
    c.font = "700 20px system-ui";
    c.fillText("READY", 640, 194);
  }
  if (s.screen === "paused") {
    overlay(c);
    panel(c);
    c.textAlign = "center";
    c.fillStyle = CYAN;
    c.font = "800 54px system-ui";
    c.fillText("PAUSED", 640, 200);
    drawMenu(c, C.PAUSE_ITEMS, s.menuIndex);
  }
  if (s.screen === "matchover") {
    overlay(c);
    panel(c);
    c.textAlign = "center";
    c.fillStyle = GOLD;
    c.font = "800 48px system-ui";
    c.fillText(
      `${s.winner === "left" ? "PLAYER ONE" : "PLAYER TWO"} WINS`,
      640,
      190,
    );
    c.fillStyle = INK;
    c.font = "700 24px system-ui";
    c.fillText(`${s.score.p1}   —   ${s.score.p2}`, 640, 255);
    drawMenu(c, C.MATCHOVER_ITEMS, s.menuIndex);
  }
}
function glow(c: CanvasRenderingContext2D, color: string, blur: number): void {
  c.shadowColor = color;
  c.shadowBlur = blur;
}
function round(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
): void {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
  c.shadowBlur = 0;
}
function overlay(c: CanvasRenderingContext2D): void {
  c.fillStyle = "rgba(3,10,16,.66)";
  c.fillRect(0, 0, C.FIELD_W, C.FIELD_H);
}
function panel(c: CanvasRenderingContext2D): void {
  c.fillStyle = PANEL;
  c.strokeStyle = "rgba(83,240,208,.22)";
  c.lineWidth = 1;
  c.beginPath();
  c.roundRect(330, 88, 620, 550, 26);
  c.fill();
  c.stroke();
}
function drawMenu(
  c: CanvasRenderingContext2D,
  items: readonly string[],
  index: number,
): void {
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.letterSpacing = "2px";
  items.forEach((item, i) => {
    const r = rectAt(i);
    if (i === index) {
      c.fillStyle = "rgba(83,240,208,.12)";
      c.strokeStyle = "rgba(83,240,208,.65)";
      c.beginPath();
      c.roundRect(r.x, r.y, r.w, r.h, 12);
      c.fill();
      c.stroke();
    }
    c.font = `${i === index ? 800 : 600} 20px system-ui`;
    c.fillStyle = i === index ? CYAN : INK;
    c.fillText(item, 640, r.y + r.h / 2);
  });
}
