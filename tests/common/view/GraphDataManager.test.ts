import { describe, expect, it, vi } from "vitest";
import { GraphDataManager } from "../../../src/common/view/graph/GraphDataManager.js";

function createManager() {
  const setSpacing = vi.fn();
  const gridPart = { setSpacing };
  const linePlot = { setDataSet: vi.fn() };
  const chartTransform = { setModelXRange: vi.fn(), setModelYRange: vi.fn(), modelToViewPosition: vi.fn() };
  const trailNode = { removeAllChildren: vi.fn(), addChild: vi.fn() };
  const manager = new GraphDataManager(chartTransform as never, linePlot as never, trailNode as never, 100, {
    verticalGridLineSet: gridPart,
    horizontalGridLineSet: gridPart,
    xTickMarkSet: gridPart,
    yTickMarkSet: gridPart,
    xTickLabelSet: gridPart,
    yTickLabelSet: gridPart,
  } as never);
  return { manager, linePlot };
}

describe("GraphDataManager.discardDataFrom", () => {
  it("keeps history recorded before the given time", () => {
    const { manager, linePlot } = createManager();
    for (let i = 0; i < 5; i++) {
      manager.addDataPoint(i, i * i, i * 0.1);
    }

    manager.discardDataFrom(0.3);

    expect(manager.getDataPointCount()).toBe(3);
    expect(linePlot.setDataSet).toHaveBeenLastCalledWith([
      expect.objectContaining({ x: 0 }),
      expect.objectContaining({ x: 1 }),
      expect.objectContaining({ x: 2 }),
    ]);
  });

  it("does nothing when no point is at or after the given time", () => {
    const { manager, linePlot } = createManager();
    manager.addDataPoint(1, 1, 0.1);
    linePlot.setDataSet.mockClear();

    manager.discardDataFrom(0.2);

    expect(manager.getDataPointCount()).toBe(1);
    expect(linePlot.setDataSet).not.toHaveBeenCalled();
  });
});
