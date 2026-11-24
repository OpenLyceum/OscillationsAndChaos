/**
 * Screen for the Double Spring simulation.
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Screen, type ScreenOptions } from "scenerystack/sim";
import { OscillationsAndChaosKeyboardHelpContent } from "../common/view/OscillationsAndChaosKeyboardHelpContent.js";
import OscillationsAndChaosNamespace from "../OscillationsAndChaosNamespace.js";
import type { OscillationsAndChaosPreferencesModel } from "../preferences/OscillationsAndChaosPreferencesModel.js";
import { DoubleSpringModel } from "./model/DoubleSpringModel.js";
import { DoubleSpringScreenView } from "./view/DoubleSpringScreenView.js";

export class DoubleSpringScreen extends Screen<DoubleSpringModel, DoubleSpringScreenView> {
  public constructor(options: ScreenOptions & { preferences: OscillationsAndChaosPreferencesModel }) {
    super(
      () => new DoubleSpringModel(options.preferences),
      (model) => new DoubleSpringScreenView(model),
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
OscillationsAndChaosNamespace.register("DoubleSpringScreen", DoubleSpringScreen);
