import { describe, expect, it } from "vitest";
import { AdaptiveRK45Solver } from "../../../src/common/model/AdaptiveRK45Solver.js";
import { DormandPrince87Solver } from "../../../src/common/model/DormandPrince87Solver.js";
import { ForestRuthPEFRLSolver } from "../../../src/common/model/ForestRuthPEFRLSolver.js";
import { RungeKuttaSolver } from "../../../src/common/model/RungeKuttaSolver.js";

const solverClasses = [RungeKuttaSolver, AdaptiveRK45Solver, DormandPrince87Solver, ForestRuthPEFRLSolver];

for (const Solver of solverClasses) {
  describe(Solver.name, () => {
    for (const dt of [0.08, -0.08]) {
      it(`integrates a fast oscillator over ${dt} seconds using the nominal substep`, () => {
        const solver = new Solver();
        solver.setFixedTimeStep(0.001);
        const state = [1, 0];
        const frequency = 20;
        const time = solver.step(
          state,
          (s, d) => {
            d[0] = s[1]!;
            d[1] = -frequency * frequency * s[0]!;
          },
          1,
          dt,
        );

        expect(time).toBeCloseTo(1 + dt, 12);
        expect(state[0]).toBeCloseTo(Math.cos(frequency * dt), 6);
        expect(state[1]).toBeCloseTo(-frequency * Math.sin(frequency * dt), 6);
      });
    }
  });
}

describe("PEFRL state layout", () => {
  it("integrates interleaved positions and velocities independently", () => {
    const solver = new ForestRuthPEFRLSolver();
    const state = [1, 0, 0, 2];
    solver.step(
      state,
      (s, d) => {
        d[0] = s[1]!;
        d[1] = -s[0]!;
        d[2] = s[3]!;
        d[3] = -4 * s[2]!;
      },
      0,
      0.08,
    );

    expect(state[0]).toBeCloseTo(Math.cos(0.08), 10);
    expect(state[1]).toBeCloseTo(-Math.sin(0.08), 10);
    expect(state[2]).toBeCloseTo(Math.sin(0.16), 10);
    expect(state[3]).toBeCloseTo(2 * Math.cos(0.16), 10);
  });
});

it("RK45 returns the fifth-order solution when internal steps stay below tolerance", () => {
  const errors: number[] = [];
  for (const h of [0.05, 0.025]) {
    const solver = new AdaptiveRK45Solver();
    solver.setFixedTimeStep(h);
    const state = [1];
    solver.step(
      state,
      (s, d) => {
        d[0] = s[0]!;
      },
      0,
      1,
    );
    errors.push(Math.abs(state[0]! - Math.E));
  }
  // A fifth-order method reduces global error about 32-fold when h is halved.
  expect(errors[0]! / errors[1]!).toBeGreaterThan(25);
  expect(errors[0]! / errors[1]!).toBeLessThan(40);
});
