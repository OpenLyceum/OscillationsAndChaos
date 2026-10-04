/**
 * DoublePendulumScreenSummaryContent.ts
 *
 * Accessible screen summary for the Double Pendulum screen. Play-area / control-area /
 * interaction-hint regions come from the screenSummary locale group; current details
 * is a LIVE DerivedProperty over both bob angles, angular velocities, and total energy.
 */

import { StringUtils } from "scenerystack";
import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { DoublePendulumModel } from "../model/DoublePendulumModel.js";

export class DoublePendulumScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: DoublePendulumModel) {
    const summary = StringManager.getInstance().getDoublePendulumScreenSummaryStrings();
    const voicing = StringManager.getInstance().getDoublePendulumVoicingStrings();

    const currentDetailsProperty = new DerivedProperty(
      [
        voicing.detailsStringProperty,
        model.angle1Property,
        model.angle2Property,
        model.angularVelocity1Property,
        model.angularVelocity2Property,
        model.totalEnergyProperty,
      ],
      (template, angle1, angle2, angularVelocity1, angularVelocity2, energy) => {
        const angle1Degrees = (angle1 * 180) / Math.PI;
        const angle2Degrees = (angle2 * 180) / Math.PI;
        return template
          .replace("{{angle1}}", StringUtils.toFixedNumberLTR(angle1Degrees, 1))
          .replace("{{angle2}}", StringUtils.toFixedNumberLTR(angle2Degrees, 1))
          .replace("{{angularVelocity1}}", StringUtils.toFixedNumberLTR(angularVelocity1, 2))
          .replace("{{angularVelocity2}}", StringUtils.toFixedNumberLTR(angularVelocity2, 2))
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
