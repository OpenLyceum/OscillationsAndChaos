/**
 * Screen for the Single Spring simulation.
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Screen, type ScreenOptions } from "scenerystack/sim";
import { OscillationsAndChaosKeyboardHelpContent } from "../common/view/OscillationsAndChaosKeyboardHelpContent.js";
import OscillationsAndChaosNamespace from "../OscillationsAndChaosNamespace.js";
import type { OscillationsAndChaosPreferencesModel } from "../preferences/OscillationsAndChaosPreferencesModel.js";
import { SingleSpringModel } from "./model/SingleSpringModel.js";
import { SingleSpringScreenView } from "./view/SingleSpringScreenView.js";

export class SingleSpringScreen extends Screen<SingleSpringModel, SingleSpringScreenView> {
  public constructor(options: ScreenOptions & { preferences: OscillationsAndChaosPreferencesModel }) {
    super(
      () => new SingleSpringModel(options.preferences),
      (model) => new SingleSpringScreenView(model),
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
OscillationsAndChaosNamespace.register("SingleSpringScreen", SingleSpringScreen);
