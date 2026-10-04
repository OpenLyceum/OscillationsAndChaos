import { expect, it } from "vitest";
import { DoubleSpringModel } from "../../../src/double-spring/model/DoubleSpringModel.js";

it("preserves coupled spring energy when both masses pass the former position limit", () => {
  const model = new DoubleSpringModel();
  model.position1Property.value = 5;
  model.position2Property.value = 5;
  model.velocity1Property.value = 20;
  model.velocity2Property.value = 20;
  model.damping1Property.value = 0;
  model.damping2Property.value = 0;
  const initialEnergy = model.totalEnergyProperty.value;

  model.step(0.05, true);

  expect(model.position1Property.value).toBeGreaterThan(5);
  expect(model.position2Property.value).toBeGreaterThan(5);
  expect(model.totalEnergyProperty.value).toBeCloseTo(initialEnergy, 7);
});
