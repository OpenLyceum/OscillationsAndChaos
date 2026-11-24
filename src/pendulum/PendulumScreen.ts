/**
 * Screen for the Pendulum simulation.
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Screen, type ScreenOptions } from "scenerystack/sim";
import { OscillationsAndChaosKeyboardHelpContent } from "../common/view/OscillationsAndChaosKeyboardHelpContent.js";
import OscillationsAndChaosNamespace from "../OscillationsAndChaosNamespace.js";
import type { OscillationsAndChaosPreferencesModel } from "../preferences/OscillationsAndChaosPreferencesModel.js";
import { PendulumModel } from "./model/PendulumModel.js";
import { PendulumScreenView } from "./view/PendulumScreenView.js";

export class PendulumScreen extends Screen<PendulumModel, PendulumScreenView> {
  public constructor(options: ScreenOptions & { preferences: OscillationsAndChaosPreferencesModel }) {
    super(
      () => new PendulumModel(options.preferences),
      (model) => new PendulumScreenView(model),
      optionize<ScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          createKeyboardHelpNode: () => new OscillationsAndChaosKeyboardHelpContent(),
        },
        options,
      ),
    );
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register("PendulumScreen", PendulumScreen);
