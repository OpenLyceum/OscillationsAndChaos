/**
 * OscillationsAndChaosButtonOptions.ts
 *
 * Shared flat button appearance for the sim. Rectangular and round push buttons
 * default to SceneryStack's 3-D appearance; pass these options (or spread them
 * into nested button options) for a flat look everywhere.
 */

import type { PlayPauseStepButtonGroupOptions } from "scenerystack/scenery-phet";
import { ButtonNode } from "scenerystack/sun";

/** Options for RectangularPushButton and NumberControl arrow buttons. */
export const FLAT_RECTANGULAR_BUTTON_OPTIONS = {
  buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
} as const;

/** Options for ResetAllButton (extends RoundPushButton). Same flat look as FLAT_RECTANGULAR_BUTTON_OPTIONS. */
export const FLAT_RESET_ALL_BUTTON_OPTIONS = {
  buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
} as const;

/** Options for InfoButton (extends RoundPushButton). Same flat look as FLAT_RECTANGULAR_BUTTON_OPTIONS. */
export const FLAT_INFO_BUTTON_OPTIONS = {
  buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
} as const;

/** Nested options for TimeControlNode play / pause / step round buttons. Same flat look as above. */
export const FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS = {
  playPauseButtonOptions: {
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
  },
  stepForwardButtonOptions: {
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
  },
  stepBackwardButtonOptions: {
    buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
  },
} satisfies PlayPauseStepButtonGroupOptions;
