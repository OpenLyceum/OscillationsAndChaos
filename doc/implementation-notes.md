# Implementation Notes - Oscillations and Chaos

Developer-facing notes on the architecture. The physics itself is documented for educators in
[model.md](./model.md).

## Architecture Overview

Oscillations and Chaos is a four-screen SceneryStack simulation. Shared physics infrastructure lives
in `src/common/`; each screen adds its own model and view under a concept-named folder (no
`-screen` suffix).

```
main.ts
  ├─ SingleSpringScreen     Screen<SingleSpringModel, SingleSpringScreenView>
  ├─ DoubleSpringScreen
  ├─ PendulumScreen
  └─ DoublePendulumScreen

src/common/model/
  ├─ BaseModel.ts           Template Method: time control + ODE stepping
  ├─ RungeKuttaSolver.ts, AdaptiveRK45Solver.ts, ForestRuthPEFRLSolver.ts, DormandPrince87Solver.ts
  ├─ SolverType.ts, NominalTimeStep.ts
  └─ StatePropertyMapper.ts, Preset.ts, …

src/common/view/
  └─ BaseScreenView.ts      shared layout: time controls, graphs, vectors, presets, a11y hook

src/single-spring/ | double-spring/ | pendulum/ | double-pendulum/
  each: *Screen.ts, model/*Model.ts, view/*ScreenView.ts
```

Data flows Model → View through AXON `Property` objects. Views convert physics coordinates (+y up)
to Scenery coordinates (+y down) via `ModelViewTransform2`.

## Key design decisions

- **BaseModel + strategy solvers.** Each screen model extends `BaseModel` and implements
  `getState()`, `setState()`, `getDerivatives()`. Solver choice comes from
  `OscillationsAndChaosPreferencesModel` and hot-swaps on preference change.
- **Nested constants (fleet carve-out).** There is no root `OscillationsAndChaosConstants.ts`;
  numerics live in topical files under `src/common/view/` and `src/common/util/` next to their
  consumers (see `AGENTS.md`).
- **Inline screen summaries (fleet carve-out).** Screens implement `createScreenSummaryContent()`
  in the view rather than separate `*ScreenSummaryContent.ts` files; `BaseScreenView.setupScreenSummary()`
  registers the result.
- **Spring rendering preference.** Classic 2D coil vs parametric 3D-style surface is a global
  preference, not per-screen physics.

## Model layer pattern

```typescript
// Each *Model.ts:
export class SingleSpringModel extends BaseModel {
  public getState(): number[] { return [ x, v ]; }
  public setState(s: number[]): void { … }
  public getDerivatives(_t: number, s: number[]): number[] { … }  // accelerations from forces
  public reset(): void { … }
}
```

Derived quantities (acceleration, energies) are `DerivedProperty` instances over state and
parameters. Presets implement the shared `Preset` interface for the combo box in `BaseScreenView`.

## Common components

- `BaseScreenView` — time control, Reset All, optional graphs (`ConfigurableGraph`), vector panel,
  measurement tools (stopwatch, tape, protractor), preset combo box.
- `OscillationsAndChaosColors.ts` — all `ProfileColorProperty` instances.
- Preferences — solver type, nominal time step, spring visualization, audio node.

## Accessibility

Follows [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md).
A11y strings under `accessibility` / `screenSummary` in locale JSON via
`StringManager.getAccessibilityStrings()` and per-screen `get*ScreenSummaryStrings()`. Interactive
masses/bobs go on `pdomPlayAreaNode`.

## Testing

`npm test` (vitest):

- `tests/single-spring/model/SingleSpringModel.test.ts` — representative physics tests
- `tests/memory-leak.test.ts` — fleet-standard dispose/GC regression

Gate: `npm run check && npm run lint && npm run build && npm test`.

## Multi-screen pattern

Four independent screen models (no shared root model). To add a screen: mirror an existing folder,
register in `main.ts`, add locale keys and `StringManager` getters. See [SceneryStackTemplate `doc/multi-screen.md`](https://github.com/OpenLyceum/SceneryStackTemplate/blob/main/doc/multi-screen.md).

## Internal developer notes

Additional structure notes live in `src/doc/PROJECT_STRUCTURE.md` and
`src/doc/SCENERYSTACK_PATTERNS.md` (not shipped to educators).

### Solver compatibility

All solvers use interleaved state vectors: `[position1, velocity1, position2, velocity2, ...]`.
Forward and backward integration subdivide the interval using its magnitude and apply its sign to each substep.
When PEFRL is selected, the double pendulum uses RK4 at the nominal timestep instead: its velocity-dependent
coupling is not compatible with the separable position/velocity splitting required by PEFRL.

The spring and single-pendulum models also use RK4 whenever any damping coefficient is nonzero.
Compatibility is checked on each model step, so removing damping restores PEFRL immediately.
Both solvers follow the current nominal timestep preference.

Spring positions are unbounded integration state. Pointer and keyboard dragging constrain positions
to −5–5 m in the view. A mass already outside that region can move smoothly inward without snapping;
outward dragging is constrained at its current position. The state mapper writes solver results without clamping.

### Stepping and disposal

SceneryStack advances each screen model once per frame; views only update rendering and tools.
The shared view uses changes in model time for stopwatch updates and graph sampling, including
forced steps while paused. Paused frames add no samples. Backward steps rewind a running stopwatch
without going below zero and clear graph data from the old future before sampling the new state.

Dispose views before their models. Views unlink their property and document listeners, dispose
owned tools, and dispose their node trees. Models unlink global solver preferences and dispose
state, parameter, and derived properties.

## Time control and rewind

`BaseModel` advances physics only while playing or for a forced manual step. Forward
steps save positions, velocities, and physical parameters in a bounded history of
10,000 frames. Backward steps restore a recorded frame at or before the requested
time (or the earliest retained frame), rather than integrating dissipative or
chaotic dynamics backward. Manual forward/backward pairs restore the exact saved
state. Resuming after rewind starts a new branch and discards the abandoned future.
The backward control disables when history is exhausted; time never goes below zero.

Reset and preset application use `restartTime()` to clear history, including when
the clock is already zero. Reset restores playing status and normal speed; presets
preserve play/pause status and the independent stopwatch reading. Views advance
stopwatches and graphs using changes in model time. Double-pendulum trail points
are timestamped, retained during pauses, and trimmed on rewind.
