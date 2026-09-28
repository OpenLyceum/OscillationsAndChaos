/**
 * Control panel for visualization tools.
 * Displays checkboxes for grid, distance tool, protractor, and stopwatch.
 *
 * This component provides a consistent UI for toggling measurement and visualization
 * tools across all simulation screens. Tools can be configured per screen.
 */

import { PhetFont } from "scenerystack";
import type { BooleanProperty, ReadOnlyProperty } from "scenerystack/axon";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { HBox, Text, VBox } from "scenerystack/scenery";
import { GridIcon } from "scenerystack/scenery-phet";
import { Checkbox, Panel, type PanelOptions } from "scenerystack/sun";
import OscillationsAndChaosColors from "../../OscillationsAndChaosColors.js";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";
import { oscillationsAndChaosPreferences } from "../../preferences/OscillationsAndChaosPreferencesModel.js";
import SimulationAnnouncer from "../util/SimulationAnnouncer.js";

/**
 * Configuration for a single tool
 */
export interface ToolConfig {
  showProperty: BooleanProperty;
  labelProperty: ReadOnlyProperty<string>;
  a11yStrings: {
    shown: ReadOnlyProperty<string>;
    hidden: ReadOnlyProperty<string>;
  };
}

/**
 * Self options for ToolsControlPanel - options specific to this component.
 */
type SelfOptions = {
  /** Grid visualization configuration */
  grid: ToolConfig;
  /** Distance tool (measuring tape) configuration */
  distance: ToolConfig;
  /** Stopwatch configuration */
  stopwatch: ToolConfig;
  /** Optional protractor configuration (not available on all screens) */
  protractor?: ToolConfig;
  /** Optional graph configuration */
  graph?: ToolConfig;
};

/**
 * Options for ToolsControlPanel constructor.
 * Combines self options with parent PanelOptions.
 */
export type ToolsControlPanelOptions = SelfOptions & PanelOptions;

export class ToolsControlPanel extends Panel {
  public constructor(providedOptions: ToolsControlPanelOptions) {
    const { grid, distance, stopwatch, protractor, graph, ...panelProvidedOptions } = providedOptions;

    const panelOptions = optionize<PanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        xMargin: 10,
        yMargin: 8,
        fill: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
        stroke: OscillationsAndChaosColors.controlPanelStrokeColorProperty,
        cornerRadius: 5,
      },
      panelProvidedOptions,
    );

    const gridIcon = new GridIcon({
      size: 16,
    });

    const showGridCheckbox = new Checkbox(
      grid.showProperty,
      new HBox({
        spacing: 5,
        children: [
          gridIcon,
          new Text(grid.labelProperty, {
            font: new PhetFont({ size: 14 }),
            fill: OscillationsAndChaosColors.textColorProperty,
          }),
        ],
      }),
      {
        boxWidth: 16,
        checkboxColor: OscillationsAndChaosColors.textColorProperty,
        checkboxColorBackground: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
      },
    );

    const showDistanceToolCheckbox = new Checkbox(
      distance.showProperty,
      new Text(distance.labelProperty, {
        font: new PhetFont({ size: 14 }),
        fill: OscillationsAndChaosColors.textColorProperty,
      }),
      {
        boxWidth: 16,
        checkboxColor: OscillationsAndChaosColors.textColorProperty,
        checkboxColorBackground: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
      },
    );

    const showStopwatchCheckbox = new Checkbox(
      stopwatch.showProperty,
      new Text(stopwatch.labelProperty, {
        font: new PhetFont({ size: 14 }),
        fill: OscillationsAndChaosColors.textColorProperty,
      }),
      {
        boxWidth: 16,
        checkboxColor: OscillationsAndChaosColors.textColorProperty,
        checkboxColorBackground: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
      },
    );

    const children = [showGridCheckbox, showDistanceToolCheckbox, showStopwatchCheckbox];

    // Add protractor checkbox if provided (for pendulum screens)
    if (protractor) {
      const showProtractorCheckbox = new Checkbox(
        protractor.showProperty,
        new Text(protractor.labelProperty, {
          font: new PhetFont({ size: 14 }),
          fill: OscillationsAndChaosColors.textColorProperty,
        }),
        {
          boxWidth: 16,
          checkboxColor: OscillationsAndChaosColors.textColorProperty,
          checkboxColorBackground: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
        },
      );
      // Insert protractor before stopwatch
      children.splice(2, 0, showProtractorCheckbox);
    }

    // Add graph checkbox if provided (for configurable graph)
    if (graph) {
      const showGraphCheckbox = new Checkbox(
        graph.showProperty,
        new Text(graph.labelProperty, {
          font: new PhetFont({ size: 14 }),
          fill: OscillationsAndChaosColors.textColorProperty,
        }),
        {
          boxWidth: 16,
          checkboxColor: OscillationsAndChaosColors.textColorProperty,
          checkboxColorBackground: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
        },
      );
      // Add graph checkbox at the end
      children.push(showGraphCheckbox);
    }

    const content = new VBox({
      spacing: 8,
      align: "left",
      children,
    });

    super(content, panelOptions);

    // Add accessibility announcements for tool visibility changes
    grid.showProperty.lazyLink((showGrid) => {
      if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
        const announcement = showGrid ? grid.a11yStrings.shown.value : grid.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    distance.showProperty.lazyLink((showDistanceTool) => {
      if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
        const announcement = showDistanceTool ? distance.a11yStrings.shown.value : distance.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    stopwatch.showProperty.lazyLink((showStopwatch) => {
      if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
        const announcement = showStopwatch ? stopwatch.a11yStrings.shown.value : stopwatch.a11yStrings.hidden.value;
        SimulationAnnouncer.announceSimulationState(announcement);
      }
    });

    // Add protractor announcements if provided (for pendulum screens)
    if (protractor) {
      protractor.showProperty.lazyLink((showProtractor) => {
        if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
          const announcement = showProtractor
            ? protractor.a11yStrings.shown.value
            : protractor.a11yStrings.hidden.value;
          SimulationAnnouncer.announceSimulationState(announcement);
        }
      });
    }

    // Add graph announcements if provided (for configurable graph)
    if (graph) {
      graph.showProperty.lazyLink((showGraph) => {
        if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
          const announcement = showGraph ? graph.a11yStrings.shown.value : graph.a11yStrings.hidden.value;
          SimulationAnnouncer.announceSimulationState(announcement);
        }
      });
    }
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register("ToolsControlPanel", ToolsControlPanel);
