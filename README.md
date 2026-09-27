# Oscillations And Chaos

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

A collection of four classical mechanics simulations built with [SceneryStack](https://scenerystack.org/).
Explore oscillations, coupled systems, and chaotic dynamics through real-time, physics-based models.

## Features

- **Single Spring** — mass-spring system with damping, gravity, and energy graphs
- **Double Spring** — coupled oscillators with normal modes and phase-space diagrams
- **Pendulum** — small and large angle motion with period measurement
- **Double Pendulum** — chaotic dynamics with path tracing and energy tracking
- Multiple numerical solvers (RK4, adaptive RK45, symplectic PEFRL, Dormand-Prince 8(7))
- Classic and parametric spring visualizations, projector mode, and voicing support

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run watch` | Watch TypeScript files |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^1 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
