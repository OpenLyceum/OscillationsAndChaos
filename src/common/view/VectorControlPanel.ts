/**
 * Control panel for vector visualization options.
 * Displays checkboxes for velocity, force, and acceleration vectors.
 *
 * Each checkbox includes a small arrow icon in the corresponding vector color
 * for easy visual identification. Vectors are displayed as arrows on the
 * simulation objects when enabled.
 */

import { PhetFont } from "scenerystack";
import type { BooleanProperty, ReadOnlyProperty } from "scenerystack/axon";
import { optionize } from "scenerystack/phet-core";
import { HBox, Text, VBox } from "scenerystack/scenery";
import { ArrowNode, PhetColorScheme } from "scenerystack/scenery-phet";
import { Checkbox, Panel, type PanelOptions } from "scenerystack/sun";
import OscillationsAndChaosColors from "../../OscillationsAndChaosColors.js";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";
import { oscillationsAndChaosPreferences } from "../../preferences/OscillationsAndChaosPreferencesModel.js";
import SimulationAnnouncer from "../util/SimulationAnnouncer.js";

/**
 * Configuration for a single vector type (velocity, force, or acceleration)
 */
export interface VectorConfig {
  showProperty: BooleanProperty;
  labelProperty: ReadOnlyProperty<string>;
  a11yStrings: {
    shown: ReadOnlyProperty<string>;
    hidden: ReadOnlyProperty<string>;
  };
}

/**
 * Self options for VectorControlPanel - options specific to this component.
 */
type SelfOptions = {
  /** Velocity vector configuration */
  velocity: VectorConfig;
  /** Force vector configuration */
  force: VectorConfig;
  /** Acceleration vector configuration */
  acceleration: VectorConfig;
};

/**
 * Options for VectorControlPanel constructor.
 * Combines self options with parent PanelOptions.
 */
export type VectorControlPanelOptions = SelfOptions & PanelOptions;

export class VectorControlPanel extends Panel {
  public constructor(providedOptions: VectorControlPanelOptions) {
    const options = optionize<VectorControlPanelOptions, SelfOptions, PanelOptions>()(
      {
        xMargin: 10,
        yMargin: 8,
        fill: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
        stroke: OscillationsAndChaosColors.controlPanelStrokeColorProperty,
        cornerRadius: 5,
      },
      providedOptions,
    );

    const { velocity, force, acceleration, ...panelOptions } = options;

    const velocityCheckbox = new Checkbox(
      velocity.showProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(velocity.labelProperty, {
            font: new PhetFont({ size: 12 }),
            fill: OscillationsAndChaosColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.VELOCITY,
            stroke: PhetColorScheme.VELOCITY,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
          }),
        ],
      }),
      {
        boxWidth: 14,
        checkboxColor: OscillationsAndChaosColors.textColorProperty,
        checkboxColorBackground: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
      },
    );

    const forceCheckbox = new Checkbox(
      force.showProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(force.labelProperty, {
            font: new PhetFont({ size: 12 }),
            fill: OscillationsAndChaosColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.APPLIED_FORCE,
            stroke: PhetColorScheme.APPLIED_FORCE,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
          }),
        ],
      }),
      {
        boxWidth: 14,
        checkboxColor: OscillationsAndChaosColors.textColorProperty,
        checkboxColorBackground: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
      },
    );

    const accelerationCheckbox = new Checkbox(
      acceleration.showProperty,
      new HBox({
        spacing: 5,
        children: [
          new Text(acceleration.labelProperty, {
            font: new PhetFont({ size: 12 }),
            fill: OscillationsAndChaosColors.textColorProperty,
          }),
          new ArrowNode(0, 0, 15, 0, {
            fill: PhetColorScheme.ACCELERATION,
            stroke: PhetColorScheme.ACCELERATION,
            headHeight: 6,
            headWidth: 6,
            tailWidth: 2,
          }),
        ],
      }),
      {
        boxWidth: 14,
        checkboxColor: OscillationsAndChaosColors.textColorProperty,
        checkboxColorBackground: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
      },
    );

    const content = new VBox({
      spacing: 8,
      align: "left",
      children: [velocityCheckbox, forceCheckbox, accelerationCheckbox],
    });

    super(content, panelOptions);

    // Add accessibility announcements for vector visibility changes
    velocity.showProperty.lazyLink((showVelocity) => {
      if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
        const announcement = showVelocity ? velocity.a11yStrings.shown.value : velocity.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    force.showProperty.lazyLink((showForce) => {
      if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
        const announcement = showForce ? force.a11yStrings.shown.value : force.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    acceleration.showProperty.lazyLink((showAcceleration) => {
      if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
        const announcement = showAcceleration
          ? acceleration.a11yStrings.shown.value
          : acceleration.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register("VectorControlPanel", VectorControlPanel);
