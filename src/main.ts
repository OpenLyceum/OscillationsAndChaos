/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

// Import KaTeX and make it available globally for FormulaNode
// Import CSS locally so it's bundled and works offline
import "katex/dist/katex.min.css";
import * as katex from "katex";

// Extend Window interface to include katex
declare global {
  interface Window {
    katex: typeof katex;
  }
}

window.katex = katex;

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { SolverType } from "./common/model/SolverType.js";
import {
  createDoublePendulumIcon,
  createDoubleSpringIcon,
  createPendulumIcon,
  createSingleSpringIcon,
} from "./common/OscillationsAndChaosScreenIcons.js";
import SimulationAnnouncer from "./common/util/SimulationAnnouncer.js";
import { SpringVisualizationType } from "./common/view/SpringVisualizationType.js";
import { DoublePendulumScreen } from "./double-pendulum/DoublePendulumScreen.js";
import { DoubleSpringScreen } from "./double-spring/DoubleSpringScreen.js";
import { StringManager } from "./i18n/StringManager.js";
import OscillationsAndChaosColors from "./OscillationsAndChaosColors.js";
import { PendulumScreen } from "./pendulum/PendulumScreen.js";
import { OscillationsAndChaosAudioPreferencesNode } from "./preferences/OscillationsAndChaosAudioPreferencesNode.js";
import { oscillationsAndChaosPreferences } from "./preferences/OscillationsAndChaosPreferencesModel.js";
import { OscillationsAndChaosSimulationPreferencesNode } from "./preferences/OscillationsAndChaosSimulationPreferencesNode.js";
import { SingleSpringScreen } from "./single-spring/SingleSpringScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();
  const screenNames = stringManager.getScreenNames();

  // Strings for the preference-change announcements below; the preference UI itself lives in
  // OscillationsAndChaosSimulationPreferencesNode / OscillationsAndChaosAudioPreferencesNode.
  const solverNames = stringManager.getSolverNames();
  const springTypeNames = stringManager.getSpringTypeNames();

  // Add accessibility announcements for preference changes
  const a11yStrings = stringManager.getA11yStrings();

  oscillationsAndChaosPreferences.solverTypeProperty.lazyLink((solverType) => {
    if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
      let solverName = "";
      switch (solverType) {
        case SolverType.RK4:
          solverName = solverNames.rk4StringProperty.value;
          break;
        case SolverType.ADAPTIVE_RK45:
          solverName = solverNames.adaptiveRK45StringProperty.value;
          break;
        case SolverType.FOREST_RUTH_PEFRL:
          solverName = solverNames.forestRuthPEFRLStringProperty.value;
          break;
        case SolverType.DORMAND_PRINCE_87:
          solverName = solverNames.dormandPrince87StringProperty.value;
          break;
      }
      const template = a11yStrings.solverChangedStringProperty.value;
      const announcement = template.replace("{{solver}}", solverName);
      SimulationAnnouncer.announceSimulationState(announcement);
    }
  });

  oscillationsAndChaosPreferences.springVisualizationTypeProperty.lazyLink((springType) => {
    if (oscillationsAndChaosPreferences.announceStateChangesProperty.value) {
      const springTypeName =
        springType === SpringVisualizationType.CLASSIC
          ? springTypeNames.classicStringProperty.value
          : springTypeNames.parametricStringProperty.value;
      const template = a11yStrings.springVisualizationChangedStringProperty.value;
      const announcement = template.replace("{{type}}", springTypeName);
      SimulationAnnouncer.announceSimulationState(announcement);
    }
  });

  const screens = [
    new SingleSpringScreen({
      // The screen name Property updates automatically when the locale changes
      name: screenNames.singleSpringStringProperty,
      tandem: Tandem.ROOT.createTandem("singleSpringScreen"),
      backgroundColorProperty: OscillationsAndChaosColors.backgroundColorProperty,
      homeScreenIcon: createSingleSpringIcon(),
      navigationBarIcon: createSingleSpringIcon(),
    }),
    new DoubleSpringScreen({
      // The screen name Property updates automatically when the locale changes
      name: screenNames.doubleSpringStringProperty,
      tandem: Tandem.ROOT.createTandem("doubleSpringScreen"),
      backgroundColorProperty: OscillationsAndChaosColors.backgroundColorProperty,
      homeScreenIcon: createDoubleSpringIcon(),
      navigationBarIcon: createDoubleSpringIcon(),
    }),
    new PendulumScreen({
      // The screen name Property updates automatically when the locale changes
      name: screenNames.pendulumStringProperty,
      tandem: Tandem.ROOT.createTandem("pendulumScreen"),
      backgroundColorProperty: OscillationsAndChaosColors.backgroundColorProperty,
      homeScreenIcon: createPendulumIcon(),
      navigationBarIcon: createPendulumIcon(),
    }),
    new DoublePendulumScreen({
      // The screen name Property updates automatically when the locale changes
      name: screenNames.doublePendulumStringProperty,
      tandem: Tandem.ROOT.createTandem("doublePendulumScreen"),
      backgroundColorProperty: OscillationsAndChaosColors.backgroundColorProperty,
      homeScreenIcon: createDoublePendulumIcon(),
      navigationBarIcon: createDoublePendulumIcon(),
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      simulationOptions: {
        customPreferences: [
          {
            createContent: () => new OscillationsAndChaosSimulationPreferencesNode(),
          },
        ],
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
      audioOptions: {
        // Voicing only. Leave sound off, and do not set supportsSound in src/init.ts.
        supportsSound: false,
        supportsVoicing: true,
        customPreferences: [
          {
            createContent: (tandem: Tandem) => {
              return new OscillationsAndChaosAudioPreferencesNode(tandem);
            },
            column: "right",
          },
        ],
      },
    }),
    webgl: true,
  });
  sim.start();
});
