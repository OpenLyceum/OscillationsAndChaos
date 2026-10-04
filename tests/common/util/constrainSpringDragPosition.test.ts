import { expect, it } from "vitest";
import { constrainSpringDragPosition } from "../../../src/common/util/constrainSpringDragPosition.js";

it("constrains dragging inside the normal region", () => {
  expect(constrainSpringDragPosition(1, 8)).toBe(5);
  expect(constrainSpringDragPosition(1, -8)).toBe(-5);
});

it("allows smooth inward movement from either side without a boundary snap", () => {
  expect(constrainSpringDragPosition(6, 6)).toBe(6);
  expect(constrainSpringDragPosition(6, 5.99)).toBe(5.99);
  expect(constrainSpringDragPosition(6, 6.01)).toBe(6);
  expect(constrainSpringDragPosition(-6, -6)).toBe(-6);
  expect(constrainSpringDragPosition(-6, -5.99)).toBe(-5.99);
  expect(constrainSpringDragPosition(-6, -6.01)).toBe(-6);
});
