import { describe, expect, it } from "vitest";
import { DoublePendulumModel } from "../../../src/double-pendulum/model/DoublePendulumModel.js";
import { DoubleSpringModel } from "../../../src/double-spring/model/DoubleSpringModel.js";
import { PendulumModel } from "../../../src/pendulum/model/PendulumModel.js";
import { SingleSpringModel } from "../../../src/single-spring/model/SingleSpringModel.js";

for (const Model of [SingleSpringModel, DoubleSpringModel, PendulumModel, DoublePendulumModel]) {
  describe(`${Model.name} rewind`, () => {
    const snapshot = (model: InstanceType<typeof Model>) => {
      const getState = Reflect.get(model, "getState") as () => number[];
      return getState.call(model);
    };

    it("restores exact recorded state and parameters after edits", () => {
      const model = new Model();
      try {
        model.isPlayingProperty.value = false;
        const initial = snapshot(model);
        const gravity = model.gravityProperty.value;
        model.step(0.016, true);
        const first = snapshot(model);
        model.step(0.016, true);
        model.gravityProperty.value = 1;
        model.step(-0.016, true);
        expect(model.timeProperty.value).toBeCloseTo(0.016, 12);
        expect(snapshot(model)).toEqual(first);
        expect(model.gravityProperty.value).toBe(gravity);
        model.step(-0.016, true);
        expect(model.timeProperty.value).toBe(0);
        expect(snapshot(model)).toEqual(initial);
        expect(model.canStepBackwardProperty.value).toBe(false);
        model.step(-0.016, true);
        expect(snapshot(model)).toEqual(initial);
        expect(model.timeProperty.value).toBe(0);
      } finally {
        model.dispose();
      }
    });

    it("starts a new history after reset or preset restart", () => {
      const model = new Model();
      try {
        model.step(0.016, true);
        model.reset();
        expect(model.canStepBackwardProperty.value).toBe(false);
        model.step(-0.016, true);
        expect(model.timeProperty.value).toBe(0);
        model.step(0.016, true);
        model.restartTime();
        expect(model.canStepBackwardProperty.value).toBe(false);
        const initial = snapshot(model);
        model.step(0.016, true);
        model.step(-0.016, true);
        expect(snapshot(model)).toEqual(initial);
      } finally {
        model.dispose();
      }
    });

    it("rewinds variable frames and branches from the restored state", () => {
      const model = new Model();
      try {
        model.step(0.01, true);
        const first = snapshot(model);
        model.step(0.03, true);
        model.step(-0.016, true);
        expect(model.timeProperty.value).toBeCloseTo(0.01, 12);
        expect(snapshot(model)).toEqual(first);
        model.gravityProperty.value = 1;
        model.step(0.016, true);
        const branch = snapshot(model);
        model.step(0.016, true);
        model.step(-0.016, true);
        expect(snapshot(model)).toEqual(branch);
        expect(model.gravityProperty.value).toBe(1);
      } finally {
        model.dispose();
      }
    });
  });
}
