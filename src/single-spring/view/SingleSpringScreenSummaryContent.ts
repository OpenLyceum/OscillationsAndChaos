/**
 * SingleSpringScreenSummaryContent.ts
 *
 * Accessible screen summary for the Single Spring screen. Play-area / control-area /
 * interaction-hint regions come from the screenSummary locale group; current details
 * is a LIVE DerivedProperty over mass position, velocity, spring force, and energy.
 */

import { StringUtils } from "scenerystack";
import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { SingleSpringModel } from "../model/SingleSpringModel.js";

export class SingleSpringScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: SingleSpringModel) {
    const summary = StringManager.getInstance().getSingleSpringScreenSummaryStrings();
    const voicing = StringManager.getInstance().getSingleSpringVoicingStrings();

    const currentDetailsProperty = new DerivedProperty(
      [
        voicing.detailsStringProperty,
        model.positionProperty,
        model.velocityProperty,
        model.springConstantProperty,
        model.totalEnergyProperty,
      ],
      (template, position, velocity, springConstant, energy) => {
        const force = -springConstant * position;
        return template
          .replace("{{position}}", StringUtils.toFixedNumberLTR(position, 2))
          .replace("{{velocity}}", StringUtils.toFixedNumberLTR(velocity, 2))
          .replace("{{force}}", StringUtils.toFixedNumberLTR(force, 2))
          .replace("{{energy}}", StringUtils.toFixedNumberLTR(energy, 2));
      },
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
