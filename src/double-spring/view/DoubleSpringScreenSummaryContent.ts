/**
 * DoubleSpringScreenSummaryContent.ts
 *
 * Accessible screen summary for the Double Spring screen. Play-area / control-area /
 * interaction-hint regions come from the screenSummary locale group; current details
 * is a LIVE DerivedProperty over both mass positions, velocities, and total energy.
 */

import { StringUtils } from "scenerystack";
import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { DoubleSpringModel } from "../model/DoubleSpringModel.js";

export class DoubleSpringScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: DoubleSpringModel) {
    const summary = StringManager.getInstance().getDoubleSpringScreenSummaryStrings();
    const voicing = StringManager.getInstance().getDoubleSpringVoicingStrings();

    const currentDetailsProperty = new DerivedProperty(
      [
        voicing.detailsStringProperty,
        model.position1Property,
        model.position2Property,
        model.velocity1Property,
        model.velocity2Property,
        model.totalEnergyProperty,
      ],
      (template, position1, position2, velocity1, velocity2, energy) =>
        template
          .replace("{{position1}}", StringUtils.toFixedNumberLTR(position1, 2))
          .replace("{{position2}}", StringUtils.toFixedNumberLTR(position2, 2))
          .replace("{{velocity1}}", StringUtils.toFixedNumberLTR(velocity1, 2))
          .replace("{{velocity2}}", StringUtils.toFixedNumberLTR(velocity2, 2))
          .replace("{{energy}}", StringUtils.toFixedNumberLTR(energy, 2)),
    );

    super({
      playAreaContent: summary.playAreaDescriptionStringProperty,
      controlAreaContent: summary.controlAreaDescriptionStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: summary.interactionHintStringProperty,
    });
    this.disposeEmitter.addListener(() => currentDetailsProperty.dispose());
  }
}
