import { Stopwatch, TimeSpeed } from "scenerystack/scenery-phet";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BaseScreenView } from "../../../src/common/view/BaseScreenView.js";
import { DoublePendulumModel } from "../../../src/double-pendulum/model/DoublePendulumModel.js";
import { DoublePendulumScreenView } from "../../../src/double-pendulum/view/DoublePendulumScreenView.js";
import { DoubleSpringModel } from "../../../src/double-spring/model/DoubleSpringModel.js";
import { DoubleSpringScreenView } from "../../../src/double-spring/view/DoubleSpringScreenView.js";
import { PendulumModel } from "../../../src/pendulum/model/PendulumModel.js";
import { PendulumScreenView } from "../../../src/pendulum/view/PendulumScreenView.js";
import { SingleSpringModel } from "../../../src/single-spring/model/SingleSpringModel.js";
import { SingleSpringScreenView } from "../../../src/single-spring/view/SingleSpringScreenView.js";

const models: SingleSpringModel[] = [];
const stopwatches: Stopwatch[] = [];
afterEach(() => {
  for (const stopwatch of stopwatches.splice(0)) {
    stopwatch.dispose();
  }
  for (const model of models.splice(0)) {
    model.dispose();
  }
});

function fixture() {
  const model = new SingleSpringModel();
  models.push(model);
  const stopwatch = new Stopwatch();
  stopwatches.push(stopwatch);
  stopwatch.isRunningProperty.value = true;
  const graph = { addDataPoint: vi.fn(), discardDataFrom: vi.fn() };
  const view = { model, lastModelTime: 0, stopwatch, configurableGraph: graph };
  const step = (dt: number) => {
    model.step(dt);
    BaseScreenView.prototype.step.call(view as never, dt);
  };
  return { model, stopwatch, graph, view, step };
}

describe("Simulation time in the view", () => {
  it("does not advance the stopwatch or replace graph history while paused", () => {
    const { model, stopwatch, graph, step } = fixture();
    step(0.02);
    model.isPlayingProperty.value = false;
    for (let i = 0; i < 2100; i++) {
      step(1 / 60);
    }
    expect(stopwatch.timeProperty.value).toBeCloseTo(0.02, 12);
    expect(graph.addDataPoint).toHaveBeenCalledTimes(1);
  });

  it("follows slow and fast playback and caps long frame intervals", () => {
    const { model, stopwatch, step } = fixture();
    model.timeSpeedProperty.value = TimeSpeed.SLOW;
    step(0.02);
    expect(stopwatch.timeProperty.value).toBeCloseTo(0.01, 12);
    model.timeSpeedProperty.value = TimeSpeed.FAST;
    step(0.02);
    expect(stopwatch.timeProperty.value).toBeCloseTo(0.05, 12);
    step(1);
    expect(stopwatch.timeProperty.value).toBeCloseTo(0.25, 12);
    expect(stopwatch.timeProperty.value).toBeCloseTo(model.timeProperty.value, 12);
  });

  it("follows manual steps while paused and discards graph data from the old future", () => {
    const { model, stopwatch, graph, view } = fixture();
    model.isPlayingProperty.value = false;
    model.timeSpeedProperty.value = TimeSpeed.FAST;
    model.step(0.016, true);
    BaseScreenView.prototype.step.call(view as never, 0.016);
    expect(stopwatch.timeProperty.value).toBeCloseTo(0.016, 12);
    model.step(-0.016, true);
    BaseScreenView.prototype.step.call(view as never, -0.016);
    expect(stopwatch.timeProperty.value).toBeCloseTo(0, 12);
    expect(graph.discardDataFrom).toHaveBeenCalledExactlyOnceWith(model.timeProperty.value);
    expect(graph.addDataPoint).toHaveBeenCalledTimes(2);
  });

  it("restarting model time for a preset is not treated as a backward step", () => {
    const { model, stopwatch, graph, view, step } = fixture();
    step(0.02);
    const restartModelTime = Reflect.get(BaseScreenView.prototype, "restartModelTime") as () => void;
    restartModelTime.call(view);
    BaseScreenView.prototype.step.call(view as never, 1 / 60);
    expect(model.timeProperty.value).toBe(0);
    expect(stopwatch.timeProperty.value).toBeCloseTo(0.02, 12);
    expect(graph.discardDataFrom).not.toHaveBeenCalled();
  });
});

for (const [Model, View] of [
  [SingleSpringModel, SingleSpringScreenView],
  [DoubleSpringModel, DoubleSpringScreenView],
  [PendulumModel, PendulumScreenView],
  [DoublePendulumModel, DoublePendulumScreenView],
] as const) {
  it(`${View.name} advances physics only through the framework's model step`, () => {
    const model = new Model();
    const view = {
      model,
      lastModelTime: 0,
      stopwatch: null,
      configurableGraph: null,
      updateVectors: () => {
        /* Rendering is outside this test. */
      },
      updateVisualization: () => {
        /* Rendering is outside this test. */
      },
    };
    try {
      model.step(0.02);
      View.prototype.step.call(view as never, 0.02);
      expect(model.timeProperty.value).toBeCloseTo(0.02, 12);
      View.prototype.step.call(view as never, 0);
      expect(model.timeProperty.value).toBeCloseTo(0.02, 12);
    } finally {
      model.dispose();
    }
  });
}
