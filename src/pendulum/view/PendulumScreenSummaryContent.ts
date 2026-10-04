/**
 * PendulumScreenSummaryContent.ts
 *
 * Accessible screen summary for the Pendulum screen. Play-area / control-area /
 * interaction-hint regions come from the screenSummary locale group; current details
 * is a LIVE DerivedProperty over angle, angular velocity, and energy terms.
 */

import { StringUtils } from "scenerystack";
import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { PendulumModel } from "../model/PendulumModel.js";

export class PendulumScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: PendulumModel) {
    const summary = StringManager.getInstance().getPendulumScreenSummaryStrings();
    const voicing = StringManager.getInstance().getPendulumVoicingStrings();

    const currentDetailsProperty = new DerivedProperty(
      [
        voicing.detailsStringProperty,
        model.angleProperty,
        model.angularVelocityProperty,
        model.potentialEnergyProperty,
        model.kineticEnergyProperty,
      ],
      (template, angle, angularVelocity, potentialEnergy, kineticEnergy) => {
        const angleDegrees = (angle * 180) / Math.PI;
        return template
          .replace("{{angle}}", StringUtils.toFixedNumberLTR(angleDegrees, 1))
          .replace("{{angularVelocity}}", StringUtils.toFixedNumberLTR(angularVelocity, 2))
          .replace("{{potentialEnergy}}", StringUtils.toFixedNumberLTR(potentialEnergy, 2))
          .replace("{{kineticEnergy}}", StringUtils.toFixedNumberLTR(kineticEnergy, 2));
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
