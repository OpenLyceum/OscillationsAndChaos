import type { Vector2 } from "scenerystack/dot";
import { expect, it, vi } from "vitest";
import { DoublePendulumModel } from "../../../src/double-pendulum/model/DoublePendulumModel.js";
import { DoublePendulumScreenView } from "../../../src/double-pendulum/view/DoublePendulumScreenView.js";
import { OscillationsAndChaosPreferencesModel } from "../../../src/preferences/OscillationsAndChaosPreferencesModel.js";

// Dialog hosting needs a running Sim; retain its content tree while omitting that host.
vi.mock("scenerystack/sim", async (importOriginal) => {
  const actual = await importOriginal<typeof import("scenerystack/sim")>();
  const { Node } = await import("scenerystack/scenery");
  return {
    ...actual,
    Dialog: class extends Node {
      constructor(content: InstanceType<typeof Node>) {
        super({ children: [content] });
      }
      show(): void {
        /* Hosting is outside this test. */
      }
      hide(): void {
        /* Hosting is outside this test. */
      }
    },
  };
});

it("preserves the trail during pause and removes the abandoned future on rewind", () => {
  vi.stubGlobal("katex", { render: vi.fn() });
  const model = new DoublePendulumModel(new OscillationsAndChaosPreferencesModel());
  const view = new DoublePendulumScreenView(model);
  const trail = Reflect.get(view, "trail") as { readonly point: Vector2; readonly time: number }[];
  const points = () => trail.map(({ point }) => point);
  const step = (dt: number) => {
    model.step(dt, true);
    view.step(dt);
  };
  try {
    step(0.016);
    const first = points().map((point) => point.copy());
    step(0.016);
    model.isPlayingProperty.value = false;
    const paused = points().map((point) => point.copy());
    for (let i = 0; i < 600; i++) {
      model.step(1 / 60);
      view.step(1 / 60);
    }
    expect(points()).toEqual(paused);
    step(-0.016);
    expect(points()).toEqual(first);
    expect(trail.every(({ time }) => time <= model.timeProperty.value)).toBe(true);
    model.reset();
    view.reset();
    expect(trail.map(({ time }) => time)).toEqual([0]);
  } finally {
    view.dispose();
    model.dispose();
    vi.unstubAllGlobals();
  }
});
