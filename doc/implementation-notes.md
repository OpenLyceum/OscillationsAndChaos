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
register in `main.ts`, add locale keys and `StringManager` getters. See `doc/multi-screen.md`.

## Internal developer notes

Additional structure notes live in `src/doc/PROJECT_STRUCTURE.md` and
`src/doc/SCENERYSTACK_PATTERNS.md` (not shipped to educators).
