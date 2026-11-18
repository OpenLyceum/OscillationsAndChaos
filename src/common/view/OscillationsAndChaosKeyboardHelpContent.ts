/**
 * Keyboard shortcuts help content for Classical Mechanics simulations.
 * Rows for the global playback listener come from OscillationsAndChaosHotkeyData.
 * Graph pan is a RichDragListener, documented by the standard move-draggable section.
 * Every screen also has NumberControl sliders and a TimeControlNode (whose play/pause
 * button binds the global Alt+K toggle). The Double Pendulum screen adds the T trail
 * toggle (`includeTrailToggle`), rendered from the HotkeyData its listener uses.
 */

import {
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  LetterKeyNode,
  MoveDraggableItemsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { StringManager } from "../../i18n/StringManager.js";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";
import OscillationsAndChaosHotkeyData from "../OscillationsAndChaosHotkeyData.js";

export type OscillationsAndChaosKeyboardHelpContentOptions = {
  /** Document the T trail toggle (Double Pendulum only). */
  includeTrailToggle?: boolean;
};

export class OscillationsAndChaosKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor(options?: OscillationsAndChaosKeyboardHelpContentOptions) {
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

    const simulationControlsRows = [playPauseRow, resetRow, stepBackwardRow, stepForwardRow];
    if (options?.includeTrailToggle) {
      simulationControlsRows.push(
        KeyboardHelpSectionRow.fromHotkeyData(OscillationsAndChaosHotkeyData.TOGGLE_TRAIL, {
          // "t" has no entry in KeyboardHelpIconFactory's key map, so the icon is passed explicitly.
          icon: new LetterKeyNode("T"),
          labelStringProperty: keyboardShortcutsStrings.toggleTrailStringProperty,
          pdomLabelStringProperty: keyboardShortcutsStrings.toggleTrailStringProperty,
        }),
      );
    }

    const simulationControlsSection = new KeyboardHelpSection(
      keyboardShortcutsStrings.simulationControlsStringProperty,
      simulationControlsRows,
    );

    super(
      [simulationControlsSection, new TimeControlsKeyboardHelpSection()],
      [new MoveDraggableItemsKeyboardHelpSection(), new SliderControlsKeyboardHelpSection()],
      {
        columnSpacing: 20,
        sectionSpacing: 15,
      },
    );
  }
}

OscillationsAndChaosNamespace.register(
  "OscillationsAndChaosKeyboardHelpContent",
  OscillationsAndChaosKeyboardHelpContent,
);
