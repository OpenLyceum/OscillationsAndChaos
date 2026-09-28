/**
 * OscillationsAndChaosAudioPreferencesNode
 *
 * Custom audio preferences for Oscillations And Chaos.
 * Provides sim-specific voicing options that appear in the Audio preferences tab.
 *
 * This follows the pattern from membrane-transport, where custom audio preferences
 * are added to the right column of the Audio tab alongside the standard voicing controls.
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import OscillationsAndChaosColors from "../OscillationsAndChaosColors.js";
import OscillationsAndChaosNamespace from "../OscillationsAndChaosNamespace.js";
import { oscillationsAndChaosPreferences } from "./OscillationsAndChaosPreferencesModel.js";

export class OscillationsAndChaosAudioPreferencesNode extends VBox {
  public constructor(tandem: Tandem) {
    super({
      align: "left",
      spacing: 12,
      tandem: tandem,
    });

    const stringManager = StringManager.getInstance();
    const audioStrings = stringManager.getAudioPreferencesLabels();

    // Preferences dialog is always white — use control-surface colors.
    const header = new Text(audioStrings.simVoicingOptionsStringProperty, {
      font: new PhetFont({ size: 16, weight: "bold" }),
      fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
      maxWidth: 350,
    });

    const checkboxOptions = {
      boxWidth: 16,
      checkboxColor: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
      checkboxColorBackground: OscillationsAndChaosColors.controlSurfaceColorProperty,
    };

    const parameterAnnouncementsCheckbox = new Checkbox(
      oscillationsAndChaosPreferences.announceParameterChangesProperty,
      new Text(audioStrings.announceParameterChangesStringProperty, {
        font: new PhetFont(16),
        fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
        maxWidth: 350,
      }),
      {
        ...checkboxOptions,
        tandem: tandem.createTandem("parameterAnnouncementsCheckbox"),
      },
    );

    const parameterDescription = new Text(audioStrings.parameterAnnouncementsDescriptionStringProperty, {
      font: new PhetFont(12),
      fill: OscillationsAndChaosColors.descriptionTextColorProperty,
      maxWidth: 350,
    });

    const stateAnnouncementsCheckbox = new Checkbox(
      oscillationsAndChaosPreferences.announceStateChangesProperty,
      new Text(audioStrings.announceStateChangesStringProperty, {
        font: new PhetFont(16),
        fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
        maxWidth: 350,
      }),
      {
        ...checkboxOptions,
        tandem: tandem.createTandem("stateAnnouncementsCheckbox"),
      },
    );

    const stateDescription = new Text(audioStrings.stateAnnouncementsDescriptionStringProperty, {
      font: new PhetFont(12),
      fill: OscillationsAndChaosColors.descriptionTextColorProperty,
      maxWidth: 350,
    });

    const dragAnnouncementsCheckbox = new Checkbox(
      oscillationsAndChaosPreferences.announceDragInteractionsProperty,
      new Text(audioStrings.announceDragInteractionsStringProperty, {
        font: new PhetFont(16),
        fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
        maxWidth: 350,
      }),
      {
        ...checkboxOptions,
        tandem: tandem.createTandem("dragAnnouncementsCheckbox"),
      },
    );

    const dragDescription = new Text(audioStrings.dragAnnouncementsDescriptionStringProperty, {
      font: new PhetFont(12),
      fill: OscillationsAndChaosColors.descriptionTextColorProperty,
      maxWidth: 350,
    });

    this.children = [
      header,
      parameterAnnouncementsCheckbox,
      parameterDescription,
      stateAnnouncementsCheckbox,
      stateDescription,
      dragAnnouncementsCheckbox,
      dragDescription,
    ];
  }
}

OscillationsAndChaosNamespace.register(
  "OscillationsAndChaosAudioPreferencesNode",
  OscillationsAndChaosAudioPreferencesNode,
);
