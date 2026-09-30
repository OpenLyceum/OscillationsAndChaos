/**
 * Keyboard shortcuts help content for Classical Mechanics simulations.
 * Rows for the global playback listener come from OscillationsAndChaosHotkeyData.
 * Graph pan is a RichDragListener, documented by the standard move-draggable section.
 */

import {
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  MoveDraggableItemsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";
import OscillationsAndChaosHotkeyData from "../OscillationsAndChaosHotkeyData.js";

export class OscillationsAndChaosKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const keyboardShortcutsStrings = StringManager.getInstance().getKeyboardShortcutsStrings();

    const playPauseRow = KeyboardHelpSectionRow.fromHotkeyData(OscillationsAndChaosHotkeyData.PLAY_PAUSE, {
      labelStringProperty: keyboardShortcutsStrings.playPauseSimulationStringProperty,
      pdomLabelStringProperty: keyboardShortcutsStrings.playPauseSimulationStringProperty,
    });
    const resetRow = KeyboardHelpSectionRow.fromHotkeyData(OscillationsAndChaosHotkeyData.RESET, {
      labelStringProperty: keyboardShortcutsStrings.resetSimulationStringProperty,
      pdomLabelStringProperty: keyboardShortcutsStrings.resetSimulationStringProperty,
    });
    const stepBackwardRow = KeyboardHelpSectionRow.fromHotkeyData(OscillationsAndChaosHotkeyData.STEP_BACKWARD, {
      labelStringProperty: keyboardShortcutsStrings.stepBackwardStringProperty,
      pdomLabelStringProperty: keyboardShortcutsStrings.stepBackwardStringProperty,
    });
    const stepForwardRow = KeyboardHelpSectionRow.fromHotkeyData(OscillationsAndChaosHotkeyData.STEP_FORWARD, {
      labelStringProperty: keyboardShortcutsStrings.stepForwardStringProperty,
      pdomLabelStringProperty: keyboardShortcutsStrings.stepForwardStringProperty,
    });

    const simulationControlsSection = new KeyboardHelpSection(
      keyboardShortcutsStrings.simulationControlsStringProperty,
      [playPauseRow, resetRow, stepBackwardRow, stepForwardRow],
    );

    super([simulationControlsSection], [new MoveDraggableItemsKeyboardHelpSection()], {
      columnSpacing: 20,
      sectionSpacing: 15,
    });
  }
}

OscillationsAndChaosNamespace.register(
  "OscillationsAndChaosKeyboardHelpContent",
  OscillationsAndChaosKeyboardHelpContent,
);
