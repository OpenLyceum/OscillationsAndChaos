/**
 * Base model class for all physics simulations.
 * Provides common functionality for time control, stepping, and physics integration.
 *
 * This abstract class implements the Template Method pattern, where subclasses must
 * implement getState(), setState(), and getDerivatives() to define their specific physics.
 *
 * Responsibilities:
 * - Manages time control (play/pause, time speed, manual stepping)
 * - Handles ODE solver selection and configuration
 * - Coordinates physics integration via strategy pattern (ODESolver)
 * - Provides common reset functionality for time-related properties
 */

import { assert } from "scenerystack";
import { BooleanProperty, EnumerationProperty, NumberProperty } from "scenerystack/axon";
import { TimeSpeed } from "scenerystack/scenery-phet";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";
import { oscillationsAndChaosPreferences } from "../../preferences/OscillationsAndChaosPreferencesModel.js";
import { AdaptiveRK45Solver } from "./AdaptiveRK45Solver.js";
import { DormandPrince87Solver } from "./DormandPrince87Solver.js";
import { ForestRuthPEFRLSolver } from "./ForestRuthPEFRLSolver.js";
import type { NominalTimeStep } from "./NominalTimeStep.js";
import type { ODESolver } from "./ODESolver.js";
import { RungeKuttaSolver } from "./RungeKuttaSolver.js";
import { SolverType } from "./SolverType.js";

/**
 * Abstract base class that all physics models should extend.
 * Handles time management, play/pause state, and physics stepping.
 */
export abstract class BaseModel {
  // Time control properties (common to all simulations)
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  public readonly timeProperty: NumberProperty;
  public readonly canStepBackwardProperty = new BooleanProperty(false);

  // Bound memory while retaining roughly three minutes at 60 frames per second.
  private readonly history: { time: number; state: number[]; parameters: number[] }[] = [];
  private readonly maxHistoryLength = 10000;

  // Physics solver (can be swapped based on preference)
  protected solver: ODESolver;

  private readonly supportsPEFRL: boolean;
  private readonly solverTypeListener = (solverType: SolverType): void => {
    this.solver = this.createSolver(solverType);
  };
  private readonly nominalTimeStepListener = (nominalTimeStep: NominalTimeStep): void => {
    this.solver.setFixedTimeStep(nominalTimeStep.value);
    this.dampedSolver.setFixedTimeStep(nominalTimeStep.value);
  };
  private readonly dampedSolver = new RungeKuttaSolver();

  protected constructor(supportsPEFRL: boolean = true) {
    this.supportsPEFRL = supportsPEFRL;
    // Initialize time control properties
    this.timeProperty = new NumberProperty(0.0);

    this.isPlayingProperty = new BooleanProperty(true);

    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL);

    // Create initial physics solver based on preference
    this.solver = this.createSolver(oscillationsAndChaosPreferences.solverTypeProperty.value);

    // Listen for solver type changes and recreate solver
    oscillationsAndChaosPreferences.solverTypeProperty.link(this.solverTypeListener);

    // Listen for nominal time step changes and update the solver
    oscillationsAndChaosPreferences.nominalTimeStepProperty.link(this.nominalTimeStepListener);
  }

  /**
   * Create a solver instance based on the solver type.
   */
  private createSolver(solverType: SolverType): ODESolver {
    let solver: ODESolver;

    if (solverType === SolverType.RK4) {
      solver = new RungeKuttaSolver();
    } else if (solverType === SolverType.ADAPTIVE_RK45) {
      solver = new AdaptiveRK45Solver();
    } else if (solverType === SolverType.FOREST_RUTH_PEFRL) {
      // PEFRL requires separable position/velocity dynamics.
      solver = this.supportsPEFRL ? new ForestRuthPEFRLSolver() : new RungeKuttaSolver();
    } else if (solverType === SolverType.DORMAND_PRINCE_87) {
      solver = new DormandPrince87Solver();
    } else {
      // Default to RK4
      solver = new RungeKuttaSolver();
    }

    // Apply the current nominal time step preference
    solver.setFixedTimeStep(oscillationsAndChaosPreferences.nominalTimeStepProperty.value.value);

    return solver;
  }

  /** PEFRL requires acceleration to be independent of velocity. */
  protected isPEFRLCompatible(): boolean {
    return true;
  }

  /**
   * Reset time-related properties to their initial values.
   * Subclasses should override and call super.resetCommon() to also reset their specific properties.
   */
  protected resetCommon(): void {
    this.restartTime();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
  }

  /**
   * Step the simulation forward (or backward) in time.
   * This method handles the common stepping logic including play/pause state and time speed.
   *
   * @param dt - Time step in seconds (can be negative for backward stepping)
   * @param forceStep - If true, step even when paused (for manual stepping)
   */
  public step(dt: number, forceStep: boolean = false): void {
    // Validate input
    assert?.(Number.isFinite(dt), "dt must be finite");

    // Only step if playing (unless forced for manual stepping)
    if (dt === 0 || !(this.isPlayingProperty.value || forceStep)) {
      return;
    }

    if (dt < 0) {
      this.restorePreviousState(Math.max(0, this.timeProperty.value + dt));
      return;
    }

    // Cap dt to prevent large jumps when user switches tabs or browser loses focus
    // This prevents physics instabilities and large gaps in graphs
    const MAX_DT = 0.1; // 100ms maximum
    const cappedDt = Math.min(Math.abs(dt), MAX_DT) * Math.sign(dt);

    // Apply time speed multiplier (only when auto-playing, not for manual steps)
    const timeSpeedMultiplier = forceStep ? 1.0 : this.getTimeSpeedMultiplier();
    const adjustedDt = cappedDt * timeSpeedMultiplier;

    // Get the current state from the subclass
    const state = this.getState();

    // Validate state array returned by subclass
    assert?.(Array.isArray(state), "state must be an array");
    assert?.(state.length > 0, "state array must not be empty");
    assert?.(
      state.every((v) => Number.isFinite(v)),
      "all state values must be finite",
    );

    this.history.push({
      time: this.timeProperty.value,
      state: state.slice(),
      parameters: this.getHistoryParameters().map((property) => property.value),
    });
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    // Use solver with automatic sub-stepping
    // Check each step so changing damping immediately switches integration methods.
    const solver =
      this.solver instanceof ForestRuthPEFRLSolver && !this.isPEFRLCompatible() ? this.dampedSolver : this.solver;
    const newTime = solver.step(state, this.getDerivatives.bind(this), this.timeProperty.value, adjustedDt);

    // Validate computed time
    assert?.(Number.isFinite(newTime), "newTime must be finite");

    // Update the state in the subclass
    this.setState(state);

    // Update time
    this.timeProperty.value = newTime;
    this.canStepBackwardProperty.value = true;
  }

  /** Start a new experiment, discarding rewind history even when already at zero. */
  public restartTime(): void {
    this.history.length = 0;
    this.canStepBackwardProperty.value = false;
    this.timeProperty.value = 0;
  }

  /** Restore a recorded frame at or before the requested time, never integrate backward. */
  private restorePreviousState(targetTime: number): void {
    if (this.history.length === 0) {
      return;
    }
    let snapshot = this.history.pop()!;
    while (snapshot.time > targetTime + 1e-12 && this.history.length > 0) {
      snapshot = this.history.pop()!;
    }
    this.getHistoryParameters().forEach((property, index) => {
      property.value = snapshot.parameters[index]!;
    });
    this.setState(snapshot.state);
    this.timeProperty.value = snapshot.time;
    this.canStepBackwardProperty.value = this.history.length > 0;
  }

  /** Physical parameters must be restored together with positions and velocities. */
  protected abstract getHistoryParameters(): NumberProperty[];

  /**
   * Get the time speed multiplier based on the current time speed setting.
   */
  private getTimeSpeedMultiplier(): number {
    const timeSpeed = this.timeSpeedProperty.value;
    if (timeSpeed === TimeSpeed.SLOW) {
      return 0.5;
    } else if (timeSpeed === TimeSpeed.FAST) {
      return 2.0;
    } else {
      return 1.0; // NORMAL
    }
  }

  /**
   * Get the current state vector for physics integration.
   * Subclasses must implement this to return their state variables.
   *
   * @returns Array of state variables (e.g., [position, velocity])
   */
  protected abstract getState(): number[];

  /**
   * Update the model's properties from the state vector after integration.
   * Subclasses must implement this to update their properties.
   *
   * @param state - Array of state variables after integration
   */
  protected abstract setState(state: number[]): void;

  /**
   * Compute derivatives for the ODE solver.
   * Subclasses must implement this to define their physics equations.
   *
   * @param state - Current state vector
   * @param derivatives - Output array for derivatives
   * @param time - Current time
   */
  protected abstract getDerivatives(state: number[], derivatives: number[], time: number): void;

  /**
   * Reset the model to initial conditions.
   * Subclasses must implement this to reset all their properties.
   */
  public abstract reset(): void;

  public dispose(): void {
    oscillationsAndChaosPreferences.solverTypeProperty.unlink(this.solverTypeListener);
    oscillationsAndChaosPreferences.nominalTimeStepProperty.unlink(this.nominalTimeStepListener);
    this.history.length = 0;
    this.canStepBackwardProperty.dispose();
    this.timeProperty.dispose();
    this.isPlayingProperty.dispose();
    this.timeSpeedProperty.dispose();
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register("BaseModel", BaseModel);
