import { afterEach, expect, it, vi } from "vitest";
import { ForestRuthPEFRLSolver } from "../../../src/common/model/ForestRuthPEFRLSolver.js";
import { NominalTimeStep } from "../../../src/common/model/NominalTimeStep.js";
import { RungeKuttaSolver } from "../../../src/common/model/RungeKuttaSolver.js";
import { SolverType } from "../../../src/common/model/SolverType.js";
import { DoubleSpringModel } from "../../../src/double-spring/model/DoubleSpringModel.js";
import { PendulumModel } from "../../../src/pendulum/model/PendulumModel.js";
import { oscillationsAndChaosPreferences as preferences } from "../../../src/preferences/OscillationsAndChaosPreferencesModel.js";
import { SingleSpringModel } from "../../../src/single-spring/model/SingleSpringModel.js";

const models: (SingleSpringModel | DoubleSpringModel | PendulumModel)[] = [];
const initialSolver = preferences.solverTypeProperty.value;
const initialTimeStep = preferences.nominalTimeStepProperty.value;
afterEach(() => {
  vi.restoreAllMocks();
  for (const model of models.splice(0)) {
    model.dispose();
  }
  preferences.solverTypeProperty.value = initialSolver;
  preferences.nominalTimeStepProperty.value = initialTimeStep;
});

for (const Model of [SingleSpringModel, DoubleSpringModel, PendulumModel]) {
  it(`${Model.name} switches between RK4 and PEFRL as damping changes`, () => {
    preferences.solverTypeProperty.value = SolverType.FOREST_RUTH_PEFRL;
    const model = new Model();
    models.push(model);
    const damping =
      model instanceof DoubleSpringModel ? [model.damping1Property, model.damping2Property] : [model.dampingProperty];
    const rk4 = vi.spyOn(RungeKuttaSolver.prototype, "step");
    const pefrl = vi.spyOn(ForestRuthPEFRLSolver.prototype, "step");

    model.step(0.02, true);
    expect(rk4).toHaveBeenCalledTimes(1);
    expect(pefrl).not.toHaveBeenCalled();

    for (const property of damping) {
      property.value = 0;
    }
    model.step(0.02, true);
    expect(pefrl).toHaveBeenCalledTimes(1);
    expect(rk4).toHaveBeenCalledTimes(1);

    // For coupled springs, damping either mass must disable PEFRL.
    for (const property of damping) {
      property.value = 0.1;
      model.step(0.02, true);
      property.value = 0;
    }
    expect(rk4).toHaveBeenCalledTimes(1 + damping.length);
    expect(pefrl).toHaveBeenCalledTimes(1);
  });
}

it("uses the nominal timestep for RK4 fallback and accurately integrates strong damping", () => {
  preferences.solverTypeProperty.value = SolverType.FOREST_RUTH_PEFRL;
  const model = new PendulumModel();
  models.push(model);
  preferences.nominalTimeStepProperty.value = NominalTimeStep.MEDIUM;
  model.gravityProperty.value = 0;
  model.massProperty.value = 0.1;
  model.lengthProperty.value = 0.5;
  model.dampingProperty.value = 2;
  model.angularVelocityProperty.value = 1;
  // Record the actual solver used, including its configured timestep.
  let usedTimeStep = 0;
  const originalStep = RungeKuttaSolver.prototype.step;
  vi.spyOn(RungeKuttaSolver.prototype, "step").mockImplementation(function (
    this: RungeKuttaSolver,
    state,
    derivative,
    time,
    dt,
  ) {
    usedTimeStep = this.getFixedTimeStep();
    return originalStep.call(this, state, derivative, time, dt);
  });

  model.step(0.05, true);

  expect(usedTimeStep).toBe(0.005);
  expect(model.angularVelocityProperty.value).toBeCloseTo(Math.exp(-4), 4);
});
