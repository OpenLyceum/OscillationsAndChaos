import { expect, it, vi } from "vitest";
import { DoublePendulumModel } from "../../../src/double-pendulum/model/DoublePendulumModel.js";
import { DoublePendulumScreenView } from "../../../src/double-pendulum/view/DoublePendulumScreenView.js";
import { DoubleSpringModel } from "../../../src/double-spring/model/DoubleSpringModel.js";
import { DoubleSpringScreenView } from "../../../src/double-spring/view/DoubleSpringScreenView.js";
import { PendulumModel } from "../../../src/pendulum/model/PendulumModel.js";
import { PendulumScreenView } from "../../../src/pendulum/view/PendulumScreenView.js";

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

import { oscillationsAndChaosPreferences as preferences } from "../../../src/preferences/OscillationsAndChaosPreferencesModel.js";
import { SingleSpringModel } from "../../../src/single-spring/model/SingleSpringModel.js";
import { SingleSpringScreenView } from "../../../src/single-spring/view/SingleSpringScreenView.js";
import { forceGC } from "../../helpers/memoryLeak.js";

const screens = [
  [SingleSpringModel, SingleSpringScreenView],
  [DoubleSpringModel, DoubleSpringScreenView],
  [PendulumModel, PendulumScreenView],
  [DoublePendulumModel, DoublePendulumScreenView],
] as const;

for (const [Model, View] of screens) {
  it(`${View.name} is collected while its model remains alive`, async () => {
    vi.stubGlobal("katex", { render: vi.fn() });
    const model = new Model();
    try {
      const ref = (() => {
        const view = new View(model as never);
        const viewRef = new WeakRef(view);
        view.dispose();
        return viewRef;
      })();
      document.dispatchEvent(new Event("visibilitychange"));
      const oldStyle = preferences.springVisualizationTypeProperty.value;
      preferences.springVisualizationTypeProperty.reset();
      preferences.springVisualizationTypeProperty.value = oldStyle;
      await forceGC(ref);
      expect(ref.deref() === undefined).toBe(true);
    } finally {
      model.dispose();
      vi.unstubAllGlobals();
    }
  });
}

it("releases models after disposing their complete screens", async () => {
  vi.stubGlobal("katex", { render: vi.fn() });
  try {
    const refs = screens.flatMap(([Model, View]) => {
      const model = new Model();
      const view = new View(model as never);
      const weakRefs = [new WeakRef<object>(model), new WeakRef<object>(view)];
      view.dispose();
      model.dispose();
      return weakRefs;
    });
    await forceGC(refs);
    expect(refs.every((ref) => ref.deref() === undefined)).toBe(true);
  } finally {
    vi.unstubAllGlobals();
  }
});
