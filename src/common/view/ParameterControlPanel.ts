/**
 * Control panel for simulation parameter controls.
 * Provides a standardized panel with preset selector and parameter controls.
 *
 * This component follows the composition pattern, creating a vertical layout
 * containing a preset selector at the top and parameter sliders below.
 */

import type { NumberProperty, Property, TReadOnlyProperty } from "scenerystack/axon";
import type { Range } from "scenerystack/dot";
import { optionize } from "scenerystack/phet-core";
import { HBox, type Node, type TColor, Text, VBox } from "scenerystack/scenery";
import { NumberControl, type NumberControlOptions, PhetFont } from "scenerystack/scenery-phet";
import { Panel, type PanelOptions } from "scenerystack/sun";
import OscillationsAndChaosColors from "../../OscillationsAndChaosColors.js";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";
import type { Preset } from "../model/Preset.js";
import { FONT_SIZE_SECONDARY_LABEL } from "./FontSizeConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS } from "./OscillationsAndChaosButtonOptions.js";
import { createPresetSelector, type PresetOption } from "./PresetSelectorFactory.js";
import { PANEL_MARGIN_X, PANEL_MARGIN_Y, SPACING_MEDIUM, SPACING_SMALL } from "./UILayoutConstants.js";

/**
 * Configuration for a single parameter control
 */
interface ParameterControlConfig {
  /** Label for the control */
  labelProperty: TReadOnlyProperty<string>;
  /** Property being controlled */
  property: NumberProperty;
  /** Valid range for the parameter */
  range: Range;
  /** Step size for slider */
  delta: number;
  /** Number of decimal places to display */
  decimalPlaces: number;
  /** Unit string (e.g., "kg", "N/m", "m/s²") */
  unit: string;
  /** Optional thumb fill color for slider (for color-coding masses) */
  thumbFill?: TColor;
}

/**
 * Self options for ParameterControlPanel - options specific to this component.
 */
type SelfOptions = {
  /** Property holding the current preset selection */
  presetProperty: Property<PresetOption>;
  /** Array of available presets */
  presets: Preset[];
  /** String property for the "Custom" label */
  customLabelProperty: TReadOnlyProperty<string>;
  /** String property for the preset selector label */
  presetLabelProperty: TReadOnlyProperty<string>;
  /** Parent node for the combo box dropdown list */
  listParent: Node;
  /** Array of parameter controls to display */
  parameters: ParameterControlConfig[];
};

/**
 * Options for ParameterControlPanel constructor.
 * Combines self options with parent PanelOptions.
 */
export type ParameterControlPanelOptions = SelfOptions & PanelOptions;

/**
 * A standardized panel for simulation parameters with preset selector.
 * This class reduces boilerplate by providing a common pattern for all screen views.
 */
export class ParameterControlPanel extends Panel {
  public constructor(providedOptions: ParameterControlPanelOptions) {
    const options = optionize<ParameterControlPanelOptions, SelfOptions, PanelOptions>()(
      {
        xMargin: PANEL_MARGIN_X,
        yMargin: PANEL_MARGIN_Y,
        fill: OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
        stroke: OscillationsAndChaosColors.controlPanelStrokeColorProperty,
        cornerRadius: 5,
      },
      providedOptions,
    );

    const {
      presetProperty,
      presets,
      customLabelProperty,
      presetLabelProperty,
      listParent,
      parameters,
      ...panelOptions
    } = options;

    // Create preset selector using factory
    const presetSelector = createPresetSelector(presetProperty, presets, customLabelProperty, listParent);

    const presetLabel = new Text(presetLabelProperty, {
      font: new PhetFont({ size: FONT_SIZE_SECONDARY_LABEL }),
      fill: OscillationsAndChaosColors.textColorProperty,
    });

    const presetRow = new HBox({
      spacing: SPACING_SMALL,
      children: [presetLabel, presetSelector],
    });

    // Create parameter controls
    const parameterControls = parameters.map((paramConfig) => {
      const controlOptions: NumberControlOptions = {
        delta: paramConfig.delta,
        numberDisplayOptions: {
          decimalPlaces: paramConfig.decimalPlaces,
          valuePattern: `{{value}} ${paramConfig.unit}`,
          textOptions: { fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty },
          backgroundFill: OscillationsAndChaosColors.controlSurfaceColorProperty,
        },
        titleNodeOptions: {
          fill: OscillationsAndChaosColors.textColorProperty,
        },
        arrowButtonOptions: FLAT_RECTANGULAR_BUTTON_OPTIONS,
      };

      // Add optional thumb fill color if provided (for color-coding masses)
      if (paramConfig.thumbFill) {
        controlOptions.sliderOptions = {
          thumbFill: paramConfig.thumbFill,
        };
      }

      return new NumberControl(paramConfig.labelProperty, paramConfig.property, paramConfig.range, controlOptions);
    });

    // Assemble panel content
    const content = new VBox({
      spacing: SPACING_MEDIUM,
      align: "left",
      children: [presetRow, ...parameterControls],
    });

    // Create panel with standard styling
    super(content, panelOptions);
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register("ParameterControlPanel", ParameterControlPanel);
