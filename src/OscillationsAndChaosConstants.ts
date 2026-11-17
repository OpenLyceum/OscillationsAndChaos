/**
 * OscillationsAndChaosConstants.ts
 *
 * Root constants entry required by the fleet layout. Shared accessibility
 * announcement delays live here; `src/common/util/AccessibilityDelayConstants.ts`
 * re-exports them for existing imports.
 *
 * View-side topical numerics stay beside the views that own them:
 * - `src/common/view/SpringVisualizationConstants.ts`
 * - `src/common/view/UILayoutConstants.ts`
 * - `src/common/view/FontSizeConstants.ts`
 * - `src/common/view/DialogAndPanelConstants.ts`
 * - `src/common/view/VectorScaleConstants.ts`
 */
import OscillationsAndChaosNamespace from "./OscillationsAndChaosNamespace.js";

/**
 * Delay for parameter change announcements (ms).
 * Wait for rapid changes (e.g., slider drag events) to stabilize.
 */
export const PARAMETER_CHANGE_ANNOUNCEMENT_DELAY = 300;

/**
 * Delay for graph change announcements (ms).
 * Shorter delay for graph updates since they're less frequent.
 */
export const GRAPH_CHANGE_ANNOUNCEMENT_DELAY = 200;

OscillationsAndChaosNamespace.register("OscillationsAndChaosConstants", {
  PARAMETER_CHANGE_ANNOUNCEMENT_DELAY,
  GRAPH_CHANGE_ANNOUNCEMENT_DELAY,
});
