import { afterEach, describe, expect, it } from "vitest";
import { DoublePendulumModel } from "../../../src/double-pendulum/model/DoublePendulumModel.js";

/**
 * Independent solution of the coupled system in doc/model.md, with b₁ = b₂ = b.
 * δ = θ₁ − θ₂.
 */
function documentedAccelerations(
  theta1: number,
  theta2: number,
  omega1: number,
  omega2: number,
  m1: number,
  m2: number,
  length1: number,
  length2: number,
  gravity: number,
  damping: number,
): readonly [number, number] {
  const delta = theta1 - theta2;
  const cosDelta = Math.cos(delta);
  const sinDelta = Math.sin(delta);
  const inertia11 = (m1 + m2) * length1 * length1;
  const inertia12 = m2 * length1 * length2 * cosDelta;
  const inertia22 = m2 * length2 * length2;
  const torque1 =
    -(m1 + m2) * gravity * length1 * Math.sin(theta1) -
    damping * omega1 -
    m2 * length1 * length2 * omega2 * omega2 * sinDelta;
  const torque2 =
    -m2 * gravity * length2 * Math.sin(theta2) - damping * omega2 + m2 * length1 * length2 * omega1 * omega1 * sinDelta;
  const determinant = inertia11 * inertia22 - inertia12 * inertia12;
  return [
    (torque1 * inertia22 - inertia12 * torque2) / determinant,
    (inertia11 * torque2 - torque1 * inertia12) / determinant,
  ];
}

describe("DoublePendulumModel", () => {
  let model: DoublePendulumModel;

  afterEach(() => {
    model.reset();
  });

  it("uses the documented potential energy, without counting the lower mass twice", () => {
    model = new DoublePendulumModel();
    model.angle1Property.value = 0;
    model.angle2Property.value = 0;
    model.mass1Property.value = 1;
    model.mass2Property.value = 1;
    model.length1Property.value = 1.5;
    model.length2Property.value = 1.5;
    model.gravityProperty.value = 9.8;

    // −(m1+m2) g L1 − m2 g L2 = −44.1 J. The old formula returned −58.8 J.
    expect(model.potentialEnergyProperty.value).toBeCloseTo(-44.1, 6);
  });

  it("matches the documented accelerations when damping is on", () => {
    model = new DoublePendulumModel();
    model.angle1Property.value = 0.2;
    model.angle2Property.value = 1.1;
    model.angularVelocity1Property.value = 0.5;
    model.angularVelocity2Property.value = -0.4;
    model.mass1Property.value = 1;
    model.mass2Property.value = 1;
    model.length1Property.value = 1;
    model.length2Property.value = 1;
    model.gravityProperty.value = 9.8;
    model.dampingProperty.value = 0.3;

    const [alpha1, alpha2] = documentedAccelerations(0.2, 1.1, 0.5, -0.4, 1, 1, 1, 1, 9.8, 0.3);
    expect(model.angularAcceleration1Property.value).toBeCloseTo(alpha1, 8);
    expect(model.angularAcceleration2Property.value).toBeCloseTo(alpha2, 8);
    // Frozen values from solving the documented system, so this does not only
    // compare the model to a copy of itself.
    expect(alpha1).toBeCloseTo(0.9652871101735337, 8);
    expect(alpha2).toBeCloseTo(-9.40969594593599, 8);
  });

  it("steps the upper bob back toward vertical from a displaced rest state", () => {
    model = new DoublePendulumModel();
    model.isPlayingProperty.value = false;
    model.dampingProperty.value = 0;
    model.angle1Property.value = 0.4;
    model.angle2Property.value = 0;
    model.angularVelocity1Property.value = 0;
    model.angularVelocity2Property.value = 0;

    expect(model.angularAcceleration1Property.value).toBeLessThan(0);

    model.step(1e-4, true);

    expect(model.angularVelocity1Property.value).toBeLessThan(0);
  });
});
