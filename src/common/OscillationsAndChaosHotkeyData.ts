/**
 * OscillationsAndChaosHotkeyData.ts
 *
 * Single source of truth for the global playback shortcuts. The KeyboardListener
 * in BaseScreenView and the keyboard-help rows both derive from these instances.
 */

import { HotkeyData } from "scenerystack/scenery";

const PLAY_PAUSE_KEYS = ["space"] as const;
const RESET_KEYS = ["r"] as const;
const STEP_BACKWARD_KEYS = ["arrowLeft"] as const;
const STEP_FORWARD_KEYS = ["arrowRight"] as const;

const OscillationsAndChaosHotkeyData = {
  PLAY_PAUSE_KEYS,
  RESET_KEYS,
  STEP_BACKWARD_KEYS,
  STEP_FORWARD_KEYS,

  PLAY_PAUSE: new HotkeyData({
    keys: [...PLAY_PAUSE_KEYS],
    repoName: "oscillations-and-chaos",
    global: true,
    binderName: "Play or Pause",
  }),

  RESET: new HotkeyData({
    keys: [...RESET_KEYS],
    repoName: "oscillations-and-chaos",
    global: true,
    binderName: "Reset Simulation",
  }),

  STEP_BACKWARD: new HotkeyData({
    keys: [...STEP_BACKWARD_KEYS],
    repoName: "oscillations-and-chaos",
    global: true,
    binderName: "Step Backward",
  }),

  STEP_FORWARD: new HotkeyData({
    keys: [...STEP_FORWARD_KEYS],
    repoName: "oscillations-and-chaos",
    global: true,
    binderName: "Step Forward",
  }),
} as const;

export default OscillationsAndChaosHotkeyData;
