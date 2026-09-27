/**
 * OscillationsAndChaosPreferencesModel.ts
 *
 * Global preferences for Oscillations And Chaos.
 * Contains simulation-wide settings that users can configure.
 */

import { BooleanProperty, EnumerationProperty } from "scenerystack/axon";
import { Tandem } from "scenerystack/tandem";
import { NominalTimeStep } from "../common/model/NominalTimeStep.js";
import { SolverType } from "../common/model/SolverType.js";
import { SpringVisualizationType } from "../common/view/SpringVisualizationType.js";
import OscillationsAndChaosNamespace from "../OscillationsAndChaosNamespace.js";
import oscillationsAndChaosQueryParameters from "./oscillationsAndChaosQueryParameters.js";

/**
 * Preferences for Oscillations And Chaos. Each preference's initial value comes
 * from the corresponding query parameter (see oscillationsAndChaosQueryParameters).
 */
const OscillationsAndChaosPreferences = {
  /**
   * Whether to automatically pause the simulation when the browser tab is hidden.
   * When enabled, the simulation will pause when switching tabs or minimizing the browser,
   * preventing large dt jumps and maintaining smooth playback.
   */
  autoPauseWhenTabHiddenProperty: new BooleanProperty(oscillationsAndChaosQueryParameters.autoPauseWhenTabHidden, {
    tandem: Tandem.PREFERENCES.createTandem("simulationPreferences").createTandem("autoPauseWhenTabHiddenProperty"),
    phetioDocumentation: "Controls whether the simulation automatically pauses when the browser tab becomes hidden",
    phetioFeatured: true,
  }),

  /**
   * The ODE solver method to use for numerical integration.
   * Options: RK4, Adaptive RK45, Adaptive Euler, Modified Midpoint, Forest-Ruth PEFRL, Dormand-Prince 8(7)
   */
  solverTypeProperty: new EnumerationProperty(
    SolverType.enumeration.getValue(oscillationsAndChaosQueryParameters.solverType as string),
    {
      tandem: Tandem.PREFERENCES.createTandem("simulationPreferences").createTandem("solverTypeProperty"),
      phetioDocumentation: "Selects the numerical integration method used for solving differential equations",
      phetioFeatured: true,
    },
  ),

  /**
   * The nominal (target) time step for numerical integration in seconds.
   * For adaptive solvers, this is the initial/target step size.
   * For fixed-step solvers, this is the actual step size used.
   * Options: 0.01ms, 0.1ms, 0.5ms, 1ms (default), 5ms
   */
  nominalTimeStepProperty: new EnumerationProperty(
    NominalTimeStep.enumeration.getValue(oscillationsAndChaosQueryParameters.nominalTimeStep as string),
    {
      tandem: Tandem.PREFERENCES.createTandem("simulationPreferences").createTandem("nominalTimeStepProperty"),
      phetioDocumentation: "Sets the target time step for numerical integration in seconds",
      phetioFeatured: true,
    },
  ),

  /**
   * The spring visualization type to use for rendering springs.
   * Options: Classic (simple coil pattern), Parametric (realistic 3D appearance)
   */
  springVisualizationTypeProperty: new EnumerationProperty(
    SpringVisualizationType.enumeration.getValue(oscillationsAndChaosQueryParameters.springVisualizationType as string),
    {
      tandem: Tandem.PREFERENCES.createTandem("simulationPreferences").createTandem("springVisualizationTypeProperty"),
      phetioDocumentation: "Selects the visual style for rendering springs (Classic or Parametric)",
      phetioFeatured: true,
    },
  ),

  /**
   * Whether to respect the user's prefers-reduced-motion setting.
   * When enabled, animations will be reduced or eliminated for users who have
   * indicated they prefer reduced motion in their operating system settings.
   * This is checked automatically from the browser's media query.
   */
  reducedMotionProperty: new BooleanProperty(
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    {
      tandem: Tandem.PREFERENCES.createTandem("visualPreferences").createTandem("reducedMotionProperty"),
      phetioDocumentation: "Respects the user's operating system preference for reduced motion",
      phetioFeatured: false,
    },
  ),

  /**
   * Whether to enable high contrast mode for better visibility.
   * When enabled, uses higher contrast colors and thicker focus indicators.
   */
  highContrastModeProperty: new BooleanProperty(oscillationsAndChaosQueryParameters.highContrastMode, {
    tandem: Tandem.PREFERENCES.createTandem("visualPreferences").createTandem("highContrastModeProperty"),
    phetioDocumentation: "Enables high contrast mode with enhanced color contrast and focus indicators",
    phetioFeatured: false,
  }),

  /**
   * Voicing-specific preferences for simulation announcements
   */

  /**
   * Whether to announce parameter changes (mass, spring constant, damping, etc.)
   */
  announceParameterChangesProperty: new BooleanProperty(oscillationsAndChaosQueryParameters.announceParameterChanges, {
    tandem: Tandem.PREFERENCES.createTandem("audioPreferences").createTandem("announceParameterChangesProperty"),
    phetioDocumentation:
      "Controls voicing announcements for parameter changes such as mass, spring constant, and damping",
    phetioFeatured: true,
  }),

  /**
   * Whether to announce state changes (play/pause, reset, step, speed changes)
   */
  announceStateChangesProperty: new BooleanProperty(oscillationsAndChaosQueryParameters.announceStateChanges, {
    tandem: Tandem.PREFERENCES.createTandem("audioPreferences").createTandem("announceStateChangesProperty"),
    phetioDocumentation: "Controls voicing announcements for simulation state changes like play, pause, and reset",
    phetioFeatured: true,
  }),

  /**
   * Whether to announce drag interactions (drag start, drag end, positions)
   */
  announceDragInteractionsProperty: new BooleanProperty(oscillationsAndChaosQueryParameters.announceDragInteractions, {
    tandem: Tandem.PREFERENCES.createTandem("audioPreferences").createTandem("announceDragInteractionsProperty"),
    phetioDocumentation: "Controls voicing announcements for drag interactions with simulation objects",
    phetioFeatured: true,
  }),
};

// Register the namespace
OscillationsAndChaosNamespace.register("OscillationsAndChaosPreferences", OscillationsAndChaosPreferences);

export default OscillationsAndChaosPreferences;
