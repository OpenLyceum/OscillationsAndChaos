/**
 * Fleet-standard memory-leak regression suite.
 * StatePropertyMapper owns no global links — create, setState, drop for GC.
 */

import { NumberProperty } from "scenerystack/axon";
import { describe, expect, it } from "vitest";
import { StatePropertyMapper } from "../src/common/model/StatePropertyMapper.js";
import { DoublePendulumModel } from "../src/double-pendulum/model/DoublePendulumModel.js";
import { DoubleSpringModel } from "../src/double-spring/model/DoubleSpringModel.js";
import { PendulumModel } from "../src/pendulum/model/PendulumModel.js";
import { SingleSpringModel } from "../src/single-spring/model/SingleSpringModel.js";
import { describeDisposalLeaks, forceGC } from "./helpers/memoryLeak.js";

function createAndDisposeMapper(): WeakRef<object> {
  const p1 = new NumberProperty(1);
  const p2 = new NumberProperty(0);
  const mapper = new StatePropertyMapper([p1, p2]);
  mapper.setState([2, -1]);
  const ref = new WeakRef<object>(mapper);
  p1.dispose();
  p2.dispose();
  return ref;
}

describe("Memory leak regression", () => {
  it("StatePropertyMapper is collected after drop", async () => {
    const ref = createAndDisposeMapper();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("repeated create/dispose cycles leave no survivors", async () => {
    const refs: WeakRef<object>[] = [];
    for (let i = 0; i < 10; i++) {
      refs.push(createAndDisposeMapper());
    }
    await forceGC(refs);
    expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
  });
});

describeDisposalLeaks(
  [SingleSpringModel, DoubleSpringModel, PendulumModel, DoublePendulumModel].map((Model) => ({
    name: Model.name,
    create: () => new Model(),
  })),
);
