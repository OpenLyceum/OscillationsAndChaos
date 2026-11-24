/**
 * Fleet-standard memory-leak regression suite.
 * StatePropertyMapper owns no global links — create, setState, drop for GC.
 */

import { NumberProperty, Property } from "scenerystack/axon";
import { Node } from "scenerystack/scenery";
import { describe, expect, it } from "vitest";
import { StatePropertyMapper } from "../src/common/model/StatePropertyMapper.js";
import { ConfigurableGraph } from "../src/common/view/graph/ConfigurableGraph.js";
import type { PlottableProperty } from "../src/common/view/graph/PlottableProperty.js";
import { DoublePendulumModel } from "../src/double-pendulum/model/DoublePendulumModel.js";
import { DoubleSpringModel } from "../src/double-spring/model/DoubleSpringModel.js";
import { StringManager } from "../src/i18n/StringManager.js";
import OscillationsAndChaosColors from "../src/OscillationsAndChaosColors.js";
import { PendulumModel } from "../src/pendulum/model/PendulumModel.js";
import { OscillationsAndChaosPreferencesModel } from "../src/preferences/OscillationsAndChaosPreferencesModel.js";
import { SingleSpringModel } from "../src/single-spring/model/SingleSpringModel.js";
import { describeDisposalLeaks, expectNoListenerGrowth, forceGC } from "./helpers/memoryLeak.js";

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

// The preferences outlive each model, so a lingering preference listener would retain it.
const preferences = new OscillationsAndChaosPreferencesModel();

describeDisposalLeaks(
  [SingleSpringModel, DoubleSpringModel, PendulumModel, DoublePendulumModel].map((Model) => ({
    name: Model.name,
    create: () => new Model(preferences),
  })),
);

// ConfigurableGraph.dispose() tears down these owned helpers; they are never constructed alone.
// memory-leak-covers: GraphControlsPanel (owned by ConfigurableGraph), GraphInteractionHandler
describe("ConfigurableGraph", () => {
  it("dispose() releases every sim-lifetime Property it listened to, and never links its data", async () => {
    const timeProperty = new Property(0);
    const positionProperty = new Property(1);
    const plottables: PlottableProperty[] = [
      { name: "Time", property: timeProperty, unit: "s" },
      { name: "Position", property: positionProperty, unit: "m" },
    ];
    const [first, second] = plottables;
    if (!(first && second)) {
      throw new Error("expected two plottable properties");
    }
    const strings = StringManager.getInstance();
    const graphLabels = strings.getGraphLabels();
    const names = strings.getControlAccessibleNames();
    // A screen's combo-box list parent outlives the graph, as in BaseScreenView.
    const listParent = new Node();

    await expectNoListenerGrowth(
      [
        OscillationsAndChaosColors.controlPanelBackgroundColorProperty,
        graphLabels.titleOpenStringProperty,
        graphLabels.titleVsStringProperty,
        graphLabels.titleCloseStringProperty,
        names.xAxisStringProperty,
        names.yAxisStringProperty,
        names.rescaleStringProperty,
        names.zoomInStringProperty,
        names.panDownStringProperty,
      ],
      () => {
        const graph = new ConfigurableGraph(plottables, first, second, 300, 200, listParent);
        // The axis Properties are sampled on demand, never linked.
        expect(timeProperty.hasListeners()).toBe(false);
        expect(positionProperty.hasListeners()).toBe(false);
        graph.dispose();
      },
    );
    expect(listParent.children.length).toBe(0);
  });
});
