/**
 * OscillationsAndChaosPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in oscillationsAndChaosQueryParameters.
 *
 * One shared instance is constructed here so every screen and the Preferences
 * dialog read the same Properties. The default tandem parent is
 * Tandem.PREFERENCES, which keeps the existing PhET-iO paths.
 */

import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import { NominalTimeStep } from "../common/model/NominalTimeStep.js";
import { SolverType } from "../common/model/SolverType.js";
import { SpringVisualizationType } from "../common/view/SpringVisualizationType.js";
import OscillationsAndChaosNamespace from "../OscillationsAndChaosNamespace.js";
import oscillationsAndChaosQueryParameters from "./oscillationsAndChaosQueryParameters.js";

export class OscillationsAndChaosPreferencesModel {
  /**
   * Whether to automatically pause the simulation when the browser tab is hidden.
   * When enabled, the simulation will pause when switching tabs or minimizing the browser,
   * preventing large dt jumps and maintaining smooth playback.
   */
  public readonly autoPauseWhenTabHiddenProperty: BooleanProperty;

  /**
   * The ODE solver method to use for numerical integration.
   * Options: RK4, Adaptive RK45, Adaptive Euler, Modified Midpoint, Forest-Ruth PEFRL, Dormand-Prince 8(7)
   */
  public readonly solverTypeProperty: EnumerationProperty<SolverType>;

  /**
   * The nominal (target) time step for numerical integration in seconds.
   * For adaptive solvers, this is the initial/target step size.
   * For fixed-step solvers, this is the actual step size used.
   * Options: 0.01ms, 0.1ms, 0.5ms, 1ms (default), 5ms
   */
  public readonly nominalTimeStepProperty: EnumerationProperty<NominalTimeStep>;

  /**
   * The spring visualization type to use for rendering springs.
   * Options: Classic (simple coil pattern), Parametric (realistic 3D appearance)
   */
  public readonly springVisualizationTypeProperty: EnumerationProperty<SpringVisualizationType>;

  /**
   * Whether to respect the user's prefers-reduced-motion setting.
   * When enabled, animations will be reduced or eliminated for users who have
   * indicated they prefer reduced motion in their operating system settings.
   * This is checked automatically from the browser's media query.
   */
  public readonly reducedMotionProperty: BooleanProperty;

  /**
   * Whether to enable high contrast mode for better visibility.
   * When enabled, uses higher contrast colors and thicker focus indicators.
   */
  public readonly highContrastModeProperty: BooleanProperty;

  /**
   * Whether to announce parameter changes (mass, spring constant, damping, etc.)
   */
  public readonly announceParameterChangesProperty: BooleanProperty;

  /**
   * Whether to announce state changes (play/pause, reset, step, speed changes)
   */
  public readonly announceStateChangesProperty: BooleanProperty;

  /**
   * Whether to announce drag interactions (drag start, drag end, positions)
   */
  public readonly announceDragInteractionsProperty: BooleanProperty;

  public constructor(tandem: Tandem = Tandem.PREFERENCES) {
    const simulationTandem = tandem.createTandem("simulationPreferences");
    const visualTandem = tandem.createTandem("visualPreferences");
    const audioTandem = tandem.createTandem("audioPreferences");

    this.autoPauseWhenTabHiddenProperty = new BooleanProperty(
      oscillationsAndChaosQueryParameters.autoPauseWhenTabHidden,
      {
        tandem: simulationTandem.createTandem("autoPauseWhenTabHiddenProperty"),
        phetioDocumentation: "Controls whether the simulation automatically pauses when the browser tab becomes hidden",
        phetioFeatured: true,
      },
    );

    this.solverTypeProperty = new EnumerationProperty(
      SolverType.enumeration.getValue(oscillationsAndChaosQueryParameters.solverType as string),
      {
        tandem: simulationTandem.createTandem("solverTypeProperty"),
        phetioDocumentation: "Selects the numerical integration method used for solving differential equations",
        phetioFeatured: true,
      },
    );

    this.nominalTimeStepProperty = new EnumerationProperty(
      NominalTimeStep.enumeration.getValue(oscillationsAndChaosQueryParameters.nominalTimeStep as string),
      {
        tandem: simulationTandem.createTandem("nominalTimeStepProperty"),
        phetioDocumentation: "Sets the target time step for numerical integration in seconds",
        phetioFeatured: true,
      },
    );

    this.springVisualizationTypeProperty = new EnumerationProperty(
      SpringVisualizationType.enumeration.getValue(
        oscillationsAndChaosQueryParameters.springVisualizationType as string,
      ),
      {
        tandem: simulationTandem.createTandem("springVisualizationTypeProperty"),
        phetioDocumentation: "Selects the visual style for rendering springs (Classic or Parametric)",
        phetioFeatured: true,
      },
    );

    this.reducedMotionProperty = new BooleanProperty(
      typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      {
        tandem: visualTandem.createTandem("reducedMotionProperty"),
        phetioDocumentation: "Respects the user's operating system preference for reduced motion",
        phetioFeatured: false,
      },
    );

    this.highContrastModeProperty = new BooleanProperty(oscillationsAndChaosQueryParameters.highContrastMode, {
      tandem: visualTandem.createTandem("highContrastModeProperty"),
      phetioDocumentation: "Enables high contrast mode with enhanced color contrast and focus indicators",
      phetioFeatured: false,
    });

    this.announceParameterChangesProperty = new BooleanProperty(
      oscillationsAndChaosQueryParameters.announceParameterChanges,
      {
        tandem: audioTandem.createTandem("announceParameterChangesProperty"),
        phetioDocumentation:
          "Controls voicing announcements for parameter changes such as mass, spring constant, and damping",
        phetioFeatured: true,
      },
    );

    this.announceStateChangesProperty = new BooleanProperty(oscillationsAndChaosQueryParameters.announceStateChanges, {
      tandem: audioTandem.createTandem("announceStateChangesProperty"),
      phetioDocumentation: "Controls voicing announcements for simulation state changes like play, pause, and reset",
      phetioFeatured: true,
    });

    this.announceDragInteractionsProperty = new BooleanProperty(
      oscillationsAndChaosQueryParameters.announceDragInteractions,
      {
        tandem: audioTandem.createTandem("announceDragInteractionsProperty"),
        phetioDocumentation: "Controls voicing announcements for drag interactions with simulation objects",
        phetioFeatured: true,
      },
    );
  }

  public reset(): void {
    this.autoPauseWhenTabHiddenProperty.reset();
    this.solverTypeProperty.reset();
    this.nominalTimeStepProperty.reset();
    this.springVisualizationTypeProperty.reset();
    this.reducedMotionProperty.reset();
    this.highContrastModeProperty.reset();
    this.announceParameterChangesProperty.reset();
    this.announceStateChangesProperty.reset();
    this.announceDragInteractionsProperty.reset();
  }
}

/** Shared instance read by every screen and the Preferences dialog. */
export const oscillationsAndChaosPreferences = new OscillationsAndChaosPreferencesModel();

OscillationsAndChaosNamespace.register("OscillationsAndChaosPreferencesModel", OscillationsAndChaosPreferencesModel);
