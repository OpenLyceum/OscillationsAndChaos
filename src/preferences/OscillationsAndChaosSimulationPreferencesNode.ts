/**
 * OscillationsAndChaosSimulationPreferencesNode
 *
 * Custom simulation preferences for Oscillations And Chaos (Preferences → Simulation tab):
 * auto-pause-when-tab-hidden, the numerical solver method, the integration time step, and the
 * spring visualization style. Extracted from main.ts so the entry point only wires preferences
 * rather than building their UI inline (the {Prefix}PreferencesNode convention); the companion
 * audio-tab content is OscillationsAndChaosAudioPreferencesNode.
 */

import { HBox, HStrut, Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox, ComboBox, VerticalAquaRadioButtonGroup } from "scenerystack/sun";
import { NominalTimeStep } from "../common/model/NominalTimeStep.js";
import { SolverType } from "../common/model/SolverType.js";
import { SpringVisualizationType } from "../common/view/SpringVisualizationType.js";
import { StringManager } from "../i18n/StringManager.js";
import OscillationsAndChaosColors from "../OscillationsAndChaosColors.js";
import OscillationsAndChaosNamespace from "../OscillationsAndChaosNamespace.js";
import OscillationsAndChaosPreferences from "./OscillationsAndChaosPreferencesModel.js";

export class OscillationsAndChaosSimulationPreferencesNode extends VBox {
  public constructor() {
    const stringManager = StringManager.getInstance();
    const preferencesLabels = stringManager.getPreferencesLabels();
    const solverNames = stringManager.getSolverNames();
    const solverDescriptions = stringManager.getSolverDescriptions();
    const timeStepNames = stringManager.getTimeStepNames();
    const springTypeNames = stringManager.getSpringTypeNames();
    const springTypeDescriptions = stringManager.getSpringTypeDescriptions();

    // Auto-pause preference
    const autoPauseSection = new VBox({
      align: "left",
      spacing: 8,
      children: [
        new Checkbox(
          OscillationsAndChaosPreferences.autoPauseWhenTabHiddenProperty,
          new Text(preferencesLabels.autoPauseWhenTabHiddenStringProperty, {
            font: new PhetFont(16),
            fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
          }),
          {
            boxWidth: 16,
            checkboxColor: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
            checkboxColorBackground: OscillationsAndChaosColors.controlSurfaceColorProperty,
          },
        ),
        new Text(preferencesLabels.autoPauseDescriptionStringProperty, {
          font: new PhetFont(12),
          fill: OscillationsAndChaosColors.descriptionTextColorProperty,
          maxWidth: 600,
        }),
      ],
    });

    // Create a listParent for the combo box
    const comboBoxListParent = new Node();

    // Time step combo box
    const timeStepComboBoxItems = [
      {
        value: NominalTimeStep.FINEST,
        createNode: () =>
          new Text(timeStepNames.finestStringProperty, {
            font: new PhetFont(14),
            fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
          }),
        tandemName: "finestTimeStepItem",
      },
      {
        value: NominalTimeStep.VERY_SMALL,
        createNode: () =>
          new Text(timeStepNames.verySmallStringProperty, {
            font: new PhetFont(14),
            fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
          }),
        tandemName: "verySmallTimeStepItem",
      },
      {
        value: NominalTimeStep.SMALL,
        createNode: () =>
          new Text(timeStepNames.smallStringProperty, {
            font: new PhetFont(14),
            fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
          }),
        tandemName: "smallTimeStepItem",
      },
      {
        value: NominalTimeStep.DEFAULT,
        createNode: () =>
          new Text(timeStepNames.defaultStringProperty, {
            font: new PhetFont(14),
            fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
          }),
        tandemName: "defaultTimeStepItem",
      },
      {
        value: NominalTimeStep.MEDIUM,
        createNode: () =>
          new Text(timeStepNames.mediumStringProperty, {
            font: new PhetFont(14),
            fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
          }),
        tandemName: "mediumTimeStepItem",
      },
    ];

    const timeStepComboBox = new ComboBox(
      OscillationsAndChaosPreferences.nominalTimeStepProperty,
      timeStepComboBoxItems,
      comboBoxListParent,
      {
        cornerRadius: 5,
        xMargin: 8,
        yMargin: 4,
      },
    );

    // Time step section (right column)
    const timeStepSection = new VBox({
      align: "left",
      spacing: 8,
      children: [
        new Text(preferencesLabels.nominalTimeStepStringProperty, {
          font: new PhetFont({ size: 14, weight: "bold" }),
          fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
        }),
        new Text(preferencesLabels.nominalTimeStepDescriptionStringProperty, {
          font: new PhetFont(11),
          fill: OscillationsAndChaosColors.descriptionTextColorProperty,
          maxWidth: 280,
        }),
        timeStepComboBox,
      ],
    });

    // Solver method section (left column) - reduced maxWidth for descriptions
    const solverMethodColumn = new VBox({
      align: "left",
      spacing: 8,
      children: [
        new Text(preferencesLabels.solverMethodStringProperty, {
          font: new PhetFont({ size: 14, weight: "bold" }),
          fill: OscillationsAndChaosColors.controlSurfaceTextColorProperty,
        }),
        new VerticalAquaRadioButtonGroup(
          OscillationsAndChaosPreferences.solverTypeProperty,
          [
            {
              value: SolverType.RK4,
              createNode: () =>
                new VBox({
                  align: "left",
                  spacing: 4,
                  children: [
                    new Text(solverNames.rk4StringProperty, {
                      font: new PhetFont(14),
                    }),
                    new Text(solverDescriptions.rk4StringProperty, {
                      font: new PhetFont(11),
                      fill: OscillationsAndChaosColors.descriptionTextColorProperty,
                      maxWidth: 280,
                    }),
                  ],
                }),
              tandemName: "rk4RadioButton",
            },
            {
              value: SolverType.ADAPTIVE_RK45,
              createNode: () =>
                new VBox({
                  align: "left",
                  spacing: 4,
                  children: [
                    new Text(solverNames.adaptiveRK45StringProperty, {
                      font: new PhetFont(14),
                    }),
                    new Text(solverDescriptions.adaptiveRK45StringProperty, {
                      font: new PhetFont(11),
                      fill: OscillationsAndChaosColors.descriptionTextColorProperty,
                      maxWidth: 280,
                    }),
                  ],
                }),
              tandemName: "adaptiveRK45RadioButton",
            },
            {
              value: SolverType.FOREST_RUTH_PEFRL,
              createNode: () =>
                new VBox({
                  align: "left",
                  spacing: 4,
                  children: [
                    new Text(solverNames.forestRuthPEFRLStringProperty, {
                      font: new PhetFont(14),
                    }),
                    new Text(solverDescriptions.forestRuthPEFRLStringProperty, {
                      font: new PhetFont(11),
                      fill: OscillationsAndChaosColors.descriptionTextColorProperty,
                      maxWidth: 280,
                    }),
                  ],
                }),
              tandemName: "forestRuthPEFRLRadioButton",
            },
            {
              value: SolverType.DORMAND_PRINCE_87,
              createNode: () =>
                new VBox({
                  align: "left",
                  spacing: 4,
                  children: [
                    new Text(solverNames.dormandPrince87StringProperty, {
                      font: new PhetFont(14),
                    }),
                    new Text(solverDescriptions.dormandPrince87StringProperty, {
                      font: new PhetFont(11),
                      fill: OscillationsAndChaosColors.descriptionTextColorProperty,
                      maxWidth: 280,
                    }),
                  ],
                }),
              tandemName: "dormandPrince87RadioButton",
            },
          ],
          {
            spacing: 12,
            radioButtonOptions: {
              radius: 8,
            },
          },
        ),
      ],
    });

    // Combine solver method and time step in two columns
    const solverSection = new VBox({
      align: "left",
      spacing: 12,
      children: [
        new Text(preferencesLabels.solverDescriptionStringProperty, {
          font: new PhetFont(12),
          maxWidth: 600,
        }),
        new HBox({
          align: "top",
          spacing: 30,
          children: [solverMethodColumn, timeStepSection],
        }),
        comboBoxListParent, // Add the combo box list parent to the scene graph
      ],
    });

    // Spring visualization preference
    const springVisualizationRadioButtonGroup = new VerticalAquaRadioButtonGroup(
      OscillationsAndChaosPreferences.springVisualizationTypeProperty,
      [
        {
          value: SpringVisualizationType.CLASSIC,
          createNode: () =>
            new VBox({
              align: "left",
              spacing: 4,
              children: [
                new Text(springTypeNames.classicStringProperty, {
                  font: new PhetFont(14),
                }),
                new Text(springTypeDescriptions.classicStringProperty, {
                  font: new PhetFont(11),
                  fill: OscillationsAndChaosColors.descriptionTextColorProperty,
                  maxWidth: 550,
                }),
              ],
            }),
          tandemName: "classicSpringRadioButton",
        },
        {
          value: SpringVisualizationType.PARAMETRIC,
          createNode: () =>
            new VBox({
              align: "left",
              spacing: 4,
              children: [
                new Text(springTypeNames.parametricStringProperty, {
                  font: new PhetFont(14),
                }),
                new Text(springTypeDescriptions.parametricStringProperty, {
                  font: new PhetFont(11),
                  fill: OscillationsAndChaosColors.descriptionTextColorProperty,
                  maxWidth: 550,
                }),
              ],
            }),
          tandemName: "parametricSpringRadioButton",
        },
      ],
      {
        spacing: 12,
        radioButtonOptions: {
          radius: 8,
        },
      },
    );

    const springVisualizationSection = new VBox({
      align: "left",
      spacing: 12,
      children: [
        new Text(preferencesLabels.springVisualizationStringProperty, {
          font: new PhetFont({ size: 16, weight: "bold" }),
        }),
        new Text(preferencesLabels.springVisualizationDescriptionStringProperty, {
          font: new PhetFont(12),
          maxWidth: 600,
        }),
        springVisualizationRadioButtonGroup,
      ],
    });

    super({
      align: "left",
      spacing: 20,
      children: [
        autoPauseSection,
        new HStrut(650), // Set minimum width
        solverSection,
        springVisualizationSection,
      ],
    });
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register(
  "OscillationsAndChaosSimulationPreferencesNode",
  OscillationsAndChaosSimulationPreferencesNode,
);
