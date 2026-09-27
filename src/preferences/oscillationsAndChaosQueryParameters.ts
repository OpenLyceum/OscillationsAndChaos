/**
 * oscillationsAndChaosQueryParameters.ts
 *
 * Sim-specific startup query parameters for Oscillations And Chaos. These
 * provide the initial values for the sim-specific preferences in
 * OscillationsAndChaosPreferences. Public-facing parameters set `public: true`.
 *
 * Enumeration-valued parameters use the enumeration's string keys (e.g. "RK4")
 * and are mapped back to enumeration values in OscillationsAndChaosPreferences.
 *
 * Usage: append e.g. `?solverType=ADAPTIVE_RK45&nominalTimeStep=SMALL` to the URL.
 */

import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import { NominalTimeStep } from "../common/model/NominalTimeStep.js";
import { SolverType } from "../common/model/SolverType.js";
import { SpringVisualizationType } from "../common/view/SpringVisualizationType.js";
import OscillationsAndChaosNamespace from "../OscillationsAndChaosNamespace.js";

const oscillationsAndChaosQueryParameters = QueryStringMachine.getAll({
  /** Automatically pause the simulation when the browser tab is hidden. */
  autoPauseWhenTabHidden: {
    type: "boolean",
    defaultValue: true,
    public: true,
  },

  /** ODE solver method (enumeration key). */
  solverType: {
    type: "string",
    defaultValue: "RK4",
    validValues: SolverType.enumeration.keys,
    public: true,
  },

  /** Nominal (target) integration time step (enumeration key). */
  nominalTimeStep: {
    type: "string",
    defaultValue: "DEFAULT",
    validValues: NominalTimeStep.enumeration.keys,
    public: true,
  },

  /** Spring visualization style (enumeration key). */
  springVisualizationType: {
    type: "string",
    defaultValue: "CLASSIC",
    validValues: SpringVisualizationType.enumeration.keys,
    public: true,
  },

  /** Enable high-contrast mode. */
  highContrastMode: {
    type: "boolean",
    defaultValue: false,
    public: true,
  },

  /** Announce parameter changes via Voicing. */
  announceParameterChanges: {
    type: "boolean",
    defaultValue: true,
    public: true,
  },

  /** Announce simulation state changes via Voicing. */
  announceStateChanges: {
    type: "boolean",
    defaultValue: true,
    public: true,
  },

  /** Announce drag interactions via Voicing. */
  announceDragInteractions: {
    type: "boolean",
    defaultValue: true,
    public: true,
  },
});

OscillationsAndChaosNamespace.register("oscillationsAndChaosQueryParameters", oscillationsAndChaosQueryParameters);

// Log query parameters (for the console / PhET-iO).
logGlobal("phet.chipper.queryParameters");

export default oscillationsAndChaosQueryParameters;
