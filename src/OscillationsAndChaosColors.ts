/**
 * OscillationsAndChaosColors.ts
 *
 * Central location for all colors used in Oscillations And Chaos, providing
 * support for different color profiles (default and projector mode).
 */

import { Color, ProfileColorProperty } from "scenerystack/scenery";
import OscillationsAndChaosNamespace from "./OscillationsAndChaosNamespace.js";

const BLACK = new Color(0, 0, 0);
const WHITE = new Color(255, 255, 255);

const OscillationsAndChaosColors = {
  // Background / text
  backgroundColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "backgroundColor", {
    default: BLACK,
    projector: WHITE,
  }),
  textColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "textColor", {
    default: WHITE,
    projector: BLACK,
  }),
  disabledTextColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "disabledTextColor", {
    default: new Color(80, 80, 80),
    projector: new Color(120, 120, 120),
  }),
  // Muted gray for secondary/description text (e.g. preference-control descriptions).
  descriptionTextColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "descriptionTextColor", {
    default: new Color(80, 80, 80),
    projector: new Color(80, 80, 80),
  }),

  // Graph
  graphBackgroundColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphBackgroundColor", {
    default: new Color(25, 25, 25),
    projector: WHITE,
  }),
  graphBorderColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphBorderColor", {
    default: WHITE,
    projector: BLACK,
  }),
  graphGridColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphGridColor", {
    default: new Color(60, 60, 60),
    projector: new Color(180, 180, 180),
  }),
  graphAxisColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphAxisColor", {
    default: WHITE,
    projector: BLACK,
  }),
  graphLabelColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphLabelColor", {
    default: WHITE,
    projector: BLACK,
  }),
  graphPanelBackgroundColorProperty: new ProfileColorProperty(
    OscillationsAndChaosNamespace,
    "graphPanelBackgroundColor",
    { default: new Color(40, 40, 40, 0.9), projector: new Color(245, 245, 245) },
  ),
  graphPanelStrokeColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphPanelStrokeColor", {
    default: new Color(120, 120, 120),
    projector: new Color(150, 150, 150),
  }),
  graphLine1ColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphLine1Color", {
    default: new Color(50, 255, 50),
    projector: new Color(0, 180, 0),
  }),
  graphLine2ColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphLine2Color", {
    default: new Color(255, 80, 80),
    projector: new Color(200, 0, 0),
  }),
  graphLine3ColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphLine3Color", {
    default: new Color(100, 150, 255),
    projector: new Color(0, 0, 200),
  }),
  graphLine4ColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "graphLine4Color", {
    default: new Color(255, 200, 50),
    projector: new Color(220, 140, 0),
  }),

  // Control panel
  controlPanelBackgroundColorProperty: new ProfileColorProperty(
    OscillationsAndChaosNamespace,
    "controlPanelBackgroundColor",
    { default: new Color(30, 30, 30, 0.9), projector: new Color(255, 255, 255, 0.9) },
  ),
  controlPanelStrokeColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "controlPanelStrokeColor", {
    default: new Color(100, 100, 100),
    projector: new Color(180, 180, 180),
  }),

  // Springs
  springFrontColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "springFrontColor", {
    default: new Color(180, 180, 180),
    projector: new Color(100, 100, 100),
  }),
  springBackColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "springBackColor", {
    default: new Color(120, 120, 120),
    projector: new Color(50, 50, 50),
  }),

  // Masses / bobs (blue variant)
  mass1FillColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "mass1FillColor", {
    default: new Color(100, 170, 255),
    projector: new Color(50, 120, 200),
  }),
  mass1StrokeColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "mass1StrokeColor", {
    default: new Color(70, 140, 220),
    projector: new Color(30, 80, 130),
  }),

  // Masses / bobs (orange variant)
  mass2FillColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "mass2FillColor", {
    default: new Color(255, 150, 50),
    projector: new Color(200, 100, 30),
  }),
  mass2StrokeColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "mass2StrokeColor", {
    default: new Color(230, 120, 20),
    projector: new Color(180, 70, 0),
  }),

  // Pendulum pivot
  pivotFillColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "pivotFillColor", {
    default: new Color(160, 160, 160),
    projector: new Color(40, 40, 40),
  }),
  pivotStrokeColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "pivotStrokeColor", {
    default: WHITE,
    projector: BLACK,
  }),
  rodStrokeColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "rodStrokeColor", {
    default: new Color(200, 200, 200),
    projector: new Color(80, 80, 80),
  }),

  // Center-of-mass reference dots on pendulum bobs (fill uses textColorProperty;
  // stroke is the opposite so the ring stays visible in both profiles).
  referenceDotStrokeColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "referenceDotStrokeColor", {
    default: BLACK,
    projector: WHITE,
  }),

  // Accessibility focus indicators
  focusIndicatorColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "focusIndicatorColor", {
    default: new Color(100, 200, 255),
    projector: new Color(0, 100, 200),
  }),
  focusIndicatorHighContrastColorProperty: new ProfileColorProperty(
    OscillationsAndChaosNamespace,
    "focusIndicatorHighContrastColor",
    { default: new Color(255, 255, 0), projector: new Color(255, 0, 255) },
  ),
  interactiveHoverColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "interactiveHoverColor", {
    default: new Color(150, 220, 255, 0.3),
    projector: new Color(0, 120, 200, 0.2),
  }),

  // Scene grid
  sceneGridColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "sceneGridColor", {
    default: new Color(80, 80, 80, 0.4),
    projector: new Color(200, 200, 200, 0.5),
  }),
  sceneGridOriginColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "sceneGridOriginColor", {
    default: new Color(120, 150, 180, 0.6),
    projector: new Color(100, 120, 150, 0.7),
  }),

  // Protractor
  protractorTicksColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "protractorTicksColor", {
    default: WHITE,
    projector: BLACK,
  }),
  protractorPivotDotColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "protractorPivotDotColor", {
    default: WHITE,
    projector: BLACK,
  }),

  // Info button
  infoButtonIconColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "infoButtonIconColor", {
    default: new Color(50, 145, 184),
    projector: new Color(50, 145, 184),
  }),

  // Measuring tape
  measuringTapeTextColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "measuringTapeTextColor", {
    default: BLACK,
    projector: BLACK,
  }),
  measuringTapeTextBackgroundColorProperty: new ProfileColorProperty(
    OscillationsAndChaosNamespace,
    "measuringTapeTextBackgroundColor",
    { default: new Color(255, 255, 255, 0.8), projector: new Color(255, 255, 255, 0.8) },
  ),

  // Fleet-standard aliases for shared Panel + ButtonOptions modules.
  panelBackgroundColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "panelBackground", {
    default: new Color(30, 30, 30, 0.9),
    projector: new Color(255, 255, 255, 0.9),
  }),
  panelBorderColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "panelBorder", {
    default: new Color(100, 100, 100),
    projector: new Color(180, 180, 180),
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields, Preferences)
  // stays light in both profiles; its text stays dark.
  controlSurfaceColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(
    OscillationsAndChaosNamespace,
    "controlSurfaceDisabled",
    { default: "#cccccc", projector: "#cccccc" },
  ),
  controlSurfaceTextColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  /** Home-screen and navigation-bar icon card. White in both profiles. */
  screenIconBackgroundColorProperty: new ProfileColorProperty(OscillationsAndChaosNamespace, "screenIconBackground", {
    default: WHITE,
    projector: WHITE,
  }),
};

export default OscillationsAndChaosColors;
