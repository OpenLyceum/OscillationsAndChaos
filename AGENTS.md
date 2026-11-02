# AGENTS.md — Oscillations And Chaos

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Four classical-mechanics screens exploring oscillations and chaotic dynamics. Shared ODE
infrastructure lives in `src/common/`; each screen adds its own model and view.

Educator physics: [`doc/model.md`](doc/model.md). Architecture: [`doc/implementation-notes.md`](doc/implementation-notes.md).

| Screen | Folder | Focus |
|---|---|---|
| Single Spring | `src/single-spring/` | Mass-spring, damping, gravity, energy graphs |
| Double Spring | `src/double-spring/` | Coupled oscillators, normal modes |
| Pendulum | `src/pendulum/` | Exact sin(θ) dynamics; period vs amplitude |
| Double Pendulum | `src/double-pendulum/` | Chaos, sensitive ICs, path tracing |

Shared code uses the `OscillationsAndChaos` prefix. Concept-named folders, no `-screen` suffix.

## Key files

| Area | Location |
|---|---|
| ODE base + solvers | `src/common/model/BaseModel.ts`, `RungeKuttaSolver.ts`, `AdaptiveRK45Solver.ts`, `ForestRuthPEFRLSolver.ts`, `DormandPrince87Solver.ts`, `SolverType.ts` |
| Shared view base | `src/common/view/BaseScreenView.ts` — time controls, graphs, vectors, presets, a11y hook |
| Colors / namespace | `OscillationsAndChaosColors.ts`, `OscillationsAndChaosNamespace.ts` |
| Preferences | `src/preferences/OscillationsAndChaosPreferencesModel.ts`, `OscillationsAndChaosAudioPreferencesNode.ts`, `oscillationsAndChaosQueryParameters.ts` |
| Per-screen physics | `src/*/model/*Model.ts` |
| Per-screen views | `src/*/view/*ScreenView.ts` |
| Internal dev notes | `src/doc/PROJECT_STRUCTURE.md`, `src/doc/SCENERYSTACK_PATTERNS.md` |

## Model

- **Integration:** Each screen model extends `BaseModel` and implements `getState()`, `setState()`,
  `getDerivatives()`. Solver choice comes from `OscillationsAndChaosPreferencesModel` and
  hot-swaps on preference change (RK4 default; also adaptive RK45, Forest-Ruth PEFRL symplectic,
  Dormand-Prince 8(7)).
- **Coordinates:** model +y is up; view +y is down — convert in the view via `ModelViewTransform2`.
- **g = 9.8 m/s²** on spring/pendulum screens unless noted in `doc/model.md`.
- **Spring rendering:** Classic 2D coil vs parametric 3D-style surface is a global preference, not
  per-screen physics.

## Accessibility

Follows the shared [OpenLyceum accessibility convention](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md).
Each screen has a dedicated `*ScreenSummaryContent.ts` under its `view/` folder; `BaseScreenView.setupScreenSummary()`
registers it via `createScreenSummaryContent()`. Current-details paragraphs are live `DerivedProperty`s over model
state (from `voicing.*.details` templates). PDOM order uses `pdomPlayAreaNode` for interactive masses/bobs. A11y
strings live under `a11y` / `voicing` / `screenSummary` in each locale JSON, via `StringManager.getA11yStrings()` and
per-screen `get*ScreenSummaryStrings()` / `get*VoicingStrings()` accessors.

## Compliance carve-outs

- **Nested constants:** numerics split across topical files under `src/common/view/` and
  `src/common/util/` — no root `OscillationsAndChaosConstants.ts`.
- **Extra `src/` root entries:** `src/assets/` (bundled screenshot), `src/doc/` (internal dev
  notes), `vite-env.d.ts`.
- **Domain clock:** `BaseModel` owns play/pause and forced stepping instead of composing fleet-standard `TimeModel`.
- **Biome `style.noNonNullAssertion: off`:** dense canvas/WebGL and numeric paths use intentional
  non-null assertions; enabling the rule floods lint with noise without improving safety here.
- **Template drift (Baton `check-template-drift.sh`):** `biome.json` (the `noNonNullAssertion` override above).

## Testing

| Path | Purpose |
|---|---|
| `tests/single-spring/model/SingleSpringModel.test.ts` | Single-spring ODE stepping, reset, forced step while paused |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression |

Put unit tests only under root `tests/` (never co-locate or use `__tests__/`). Run `npm test`; CI
runs the suite when a `test` script is present. Add mirrored tests under `tests/<screen>/model/`
when extending physics on other screens.

## Development notes

- **KaTeX:** equation labels use the `katex` dependency — keep render paths in view code only.
- **Audio preferences:** sonification toggles live in `OscillationsAndChaosAudioPreferencesNode.ts`.
- **Adding a screen:** mirror existing `*Screen.ts` + `model/` + `view/` pattern; register in
  `main.ts`; add screen-summary strings and keyboard-help sections for new interactions.
- **PWA:** after `npm run build`, installable offline via Workbox (`dist/manifest.webmanifest`).
