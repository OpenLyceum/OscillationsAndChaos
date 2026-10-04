/**
 * Model for a double pendulum - two pendulums connected in series.
 *
 * This is a complex chaotic system with highly nonlinear coupled equations.
 * The equations are derived using Lagrangian mechanics.
 *
 * State variables:
 * - angle1 (θ1) - angle of first pendulum from vertical
 * - angularVelocity1 (ω1) - angular velocity of first pendulum
 * - angle2 (θ2) - angle of second pendulum from vertical
 * - angularVelocity2 (ω2) - angular velocity of second pendulum
 *
 * The full equations are quite complex and involve trigonometric functions
 * of the relative angle (θ2 - θ1).
 */

import { DerivedProperty, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { BaseModel } from "../../common/model/BaseModel.js";
import { StatePropertyMapper } from "../../common/model/StatePropertyMapper.js";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";

/**
 * Angular accelerations for the coupled system in `doc/model.md`.
 *
 * One shared damping coefficient is applied as b₁ = b₂ = b on the torque
 * right-hand sides, then the 2×2 system is solved for α₁ and α₂.
 * δ = θ₁ − θ₂.
 */
function angularAccelerations(
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
  const alpha1 = (torque1 * inertia22 - inertia12 * torque2) / determinant;
  const alpha2 = (inertia11 * torque2 - torque1 * inertia12) / determinant;
  return [alpha1, alpha2];
}

export class DoublePendulumModel extends BaseModel {
  // State variables
  public readonly angle1Property: NumberProperty;
  public readonly angularVelocity1Property: NumberProperty;
  public readonly angle2Property: NumberProperty;
  public readonly angularVelocity2Property: NumberProperty;

  // State property mapper for cleaner state management
  private readonly stateMapper: StatePropertyMapper;

  // Physics parameters
  public readonly length1Property: NumberProperty;
  public readonly length2Property: NumberProperty;
  public readonly mass1Property: NumberProperty;
  public readonly mass2Property: NumberProperty;
  public readonly gravityProperty: NumberProperty;
  public readonly dampingProperty: NumberProperty;

  // Computed values
  public readonly angularAcceleration1Property: TReadOnlyProperty<number>;
  public readonly angularAcceleration2Property: TReadOnlyProperty<number>;
  public readonly kineticEnergyProperty: TReadOnlyProperty<number>;
  public readonly potentialEnergyProperty: TReadOnlyProperty<number>;
  public readonly totalEnergyProperty: TReadOnlyProperty<number>;

  public constructor() {
    super();

    // Initialize state (both start at 90 degrees). No Range: chaotic looping must
    // be allowed to pass ±π; a finite range would clamp and freeze the motion.
    this.angle1Property = new NumberProperty(Math.PI / 2);

    this.angularVelocity1Property = new NumberProperty(0.0);

    this.angle2Property = new NumberProperty(Math.PI / 2);

    this.angularVelocity2Property = new NumberProperty(0.0);

    // Initialize parameters
    this.length1Property = new NumberProperty(1.5, {
      range: new Range(0.5, 5.0),
    });

    this.length2Property = new NumberProperty(1.5, {
      range: new Range(0.5, 5.0),
    });

    this.mass1Property = new NumberProperty(1.0, {
      range: new Range(0.1, 5.0),
    });

    this.mass2Property = new NumberProperty(1.0, {
      range: new Range(0.1, 5.0),
    });

    this.gravityProperty = new NumberProperty(9.8, {
      range: new Range(0.0, 20.0),
    });

    this.dampingProperty = new NumberProperty(0.0, {
      range: new Range(0.0, 2.0),
    });

    // Computed angular accelerations (derived from Lagrangian mechanics)
    this.angularAcceleration1Property = new DerivedProperty(
      [
        this.angle1Property,
        this.angle2Property,
        this.angularVelocity1Property,
        this.angularVelocity2Property,
        this.mass1Property,
        this.mass2Property,
        this.length1Property,
        this.length2Property,
        this.gravityProperty,
        this.dampingProperty,
      ],
      (theta1, theta2, omega1, omega2, m1, m2, L1, L2, g, b) =>
        angularAccelerations(theta1, theta2, omega1, omega2, m1, m2, L1, L2, g, b)[0],
    );

    this.angularAcceleration2Property = new DerivedProperty(
      [
        this.angle1Property,
        this.angle2Property,
        this.angularVelocity1Property,
        this.angularVelocity2Property,
        this.mass1Property,
        this.mass2Property,
        this.length1Property,
        this.length2Property,
        this.gravityProperty,
        this.dampingProperty,
      ],
      (theta1, theta2, omega1, omega2, m1, m2, L1, L2, g, b) =>
        angularAccelerations(theta1, theta2, omega1, omega2, m1, m2, L1, L2, g, b)[1],
    );

    // Compute kinetic energy (complex due to coupling between pendulums)
    // KE = (1/2) * (m1 + m2) * L1² * ω1² + (1/2) * m2 * L2² * ω2² + m2 * L1 * L2 * ω1 * ω2 * cos(θ1 - θ2)
    this.kineticEnergyProperty = new DerivedProperty(
      [
        this.angle1Property,
        this.angle2Property,
        this.angularVelocity1Property,
        this.angularVelocity2Property,
        this.mass1Property,
        this.mass2Property,
        this.length1Property,
        this.length2Property,
      ],
      (theta1, theta2, omega1, omega2, m1, m2, L1, L2) => {
        const ke1 = 0.5 * (m1 + m2) * L1 * L1 * omega1 * omega1;
        const ke2 = 0.5 * m2 * L2 * L2 * omega2 * omega2;
        const keCoupling = m2 * L1 * L2 * omega1 * omega2 * Math.cos(theta1 - theta2);
        return ke1 + ke2 + keCoupling;
      },
    );

    // PE = m1 g y1 + m2 g y2, with y measured up from the pivot:
    // y1 = −L1 cos θ1, y2 = y1 − L2 cos θ2.
    // That is −(m1+m2) g L1 cos θ1 − m2 g L2 cos θ2. Adding (m1+m2) g y1
    // on top of the absolute y2 would count the lower mass's share of y1 twice.
    this.potentialEnergyProperty = new DerivedProperty(
      [
        this.angle1Property,
        this.angle2Property,
        this.mass1Property,
        this.mass2Property,
        this.length1Property,
        this.length2Property,
        this.gravityProperty,
      ],
      (theta1, theta2, m1, m2, L1, L2, g) => -(m1 + m2) * g * L1 * Math.cos(theta1) - m2 * g * L2 * Math.cos(theta2),
    );

    // Total energy = KE + PE
    this.totalEnergyProperty = new DerivedProperty(
      [this.kineticEnergyProperty, this.potentialEnergyProperty],
      (ke, pe) => ke + pe,
    );

    // Initialize state mapper with properties in state order
    this.stateMapper = new StatePropertyMapper([
      this.angle1Property,
      this.angularVelocity1Property,
      this.angle2Property,
      this.angularVelocity2Property,
    ]);
  }

  /**
   * Get the current state vector for physics integration.
   * @returns [angle1, angularVelocity1, angle2, angularVelocity2]
   */
  protected getState(): number[] {
    return this.stateMapper.getState();
  }

  /**
   * Update the model's properties from the state vector after integration.
   * @param state - [angle1, angularVelocity1, angle2, angularVelocity2]
   */
  protected setState(state: number[]): void {
    this.stateMapper.setState(state);
  }

  /**
   * Compute derivatives for the double pendulum system.
   * These are the coupled nonlinear equations derived from Lagrangian mechanics.
   */
  protected getDerivatives(state: number[], derivatives: number[], _: number): void {
    const theta1 = state[0]!;
    const omega1 = state[1]!;
    const theta2 = state[2]!;
    const omega2 = state[3]!;

    const m1 = this.mass1Property.value;
    const m2 = this.mass2Property.value;
    const L1 = this.length1Property.value;
    const L2 = this.length2Property.value;
    const g = this.gravityProperty.value;
    const b = this.dampingProperty.value;

    const [alpha1, alpha2] = angularAccelerations(theta1, theta2, omega1, omega2, m1, m2, L1, L2, g, b);

    derivatives[0]! = omega1;
    derivatives[1]! = alpha1;
    derivatives[2]! = omega2;
    derivatives[3]! = alpha2;
  }

  /**
   * Reset the model to initial conditions.
   */
  public reset(): void {
    this.angle1Property.reset();
    this.angularVelocity1Property.reset();
    this.angle2Property.reset();
    this.angularVelocity2Property.reset();
    this.length1Property.reset();
    this.length2Property.reset();
    this.mass1Property.reset();
    this.mass2Property.reset();
    this.gravityProperty.reset();
    this.dampingProperty.reset();
    this.resetCommon(); // Reset time-related properties from base class
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register("DoublePendulumModel", DoublePendulumModel);
