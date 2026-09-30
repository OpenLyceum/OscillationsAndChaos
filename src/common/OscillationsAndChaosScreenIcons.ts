/**
 * OscillationsAndChaosScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for the four Oscillations and
 * Chaos screens. Drawn on the standard PhET 548 × 373 canvas using
 * OscillationsAndChaosColors.
 *
 *   Single Spring   — ceiling anchor, zigzag spring, one mass.
 *   Double Spring   — two masses stacked on springs.
 *   Pendulum        — pivot, rod, and bob at an angle.
 *   Double Pendulum — two linked rods and bobs.
 */
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import OscillationsAndChaosColors from "../OscillationsAndChaosColors.js";

const W = 548;
const H = 373;
const CX = W / 2;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, {
    fill: OscillationsAndChaosColors.screenIconBackgroundColorProperty,
  });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: OscillationsAndChaosColors.screenIconBackgroundColorProperty,
  });
}

function centered(graphic: Node): Node {
  graphic.centerX = CX;
  graphic.centerY = H / 2;
  return new Node({ children: [background(), graphic] });
}

function zigZagSpring(
  x: number,
  y0: number,
  height: number,
  halfWidth: number,
  coils: number,
  lineWidth: number,
): Path {
  const coilHeight = height / coils;
  const shape = new Shape().moveTo(x, y0);
  for (let i = 0; i < coils; i++) {
    const y1 = y0 + i * coilHeight + coilHeight / 3;
    const y2 = y0 + i * coilHeight + (2 * coilHeight) / 3;
    const y3 = y0 + (i + 1) * coilHeight;
    shape.lineTo(x + halfWidth, y1);
    shape.lineTo(x - halfWidth, y2);
    shape.lineTo(x, y3);
  }
  return new Path(shape, {
    stroke: OscillationsAndChaosColors.springFrontColorProperty,
    lineWidth,
    lineCap: "round",
    lineJoin: "round",
  });
}

function anchorBar(width: number): Rectangle {
  return new Rectangle(-width / 2, -10, width, 10, {
    fill: OscillationsAndChaosColors.pivotFillColorProperty,
    stroke: OscillationsAndChaosColors.pivotStrokeColorProperty,
    lineWidth: 1,
  });
}

export function createSingleSpringIcon(): ScreenIcon {
  const springHeight = 80;
  const spring = zigZagSpring(0, 0, springHeight, 15, 8, 3);
  const mass = new Rectangle(0, 0, 50, 40, {
    fill: OscillationsAndChaosColors.mass1FillColorProperty,
    stroke: OscillationsAndChaosColors.mass1StrokeColorProperty,
    lineWidth: 2,
    centerX: 0,
    top: springHeight,
  });
  return iconFrom(centered(new Node({ children: [anchorBar(40), spring, mass] })));
}

export function createDoubleSpringIcon(): ScreenIcon {
  const topSpring = zigZagSpring(0, 0, 50, 12.5, 6, 2.5);
  const mass1 = new Rectangle(-22.5, 50, 45, 35, {
    fill: OscillationsAndChaosColors.mass1FillColorProperty,
    stroke: OscillationsAndChaosColors.mass1StrokeColorProperty,
    lineWidth: 2,
  });
  const middleSpring = zigZagSpring(0, 85, 45, 12.5, 6, 2.5);
  const mass2 = new Rectangle(-22.5, 130, 45, 35, {
    fill: OscillationsAndChaosColors.mass2FillColorProperty,
    stroke: OscillationsAndChaosColors.mass2StrokeColorProperty,
    lineWidth: 2,
  });
  return iconFrom(centered(new Node({ children: [anchorBar(50), topSpring, mass1, middleSpring, mass2] })));
}

export function createPendulumIcon(): ScreenIcon {
  const rodLength = 100;
  const angle = Math.PI / 6;
  const endX = rodLength * Math.sin(angle);
  const endY = rodLength * Math.cos(angle);
  const rod = new Line(0, 0, endX, endY, {
    stroke: OscillationsAndChaosColors.rodStrokeColorProperty,
    lineWidth: 3,
    lineCap: "round",
  });
  const pivot = new Circle(5, {
    fill: OscillationsAndChaosColors.pivotFillColorProperty,
    stroke: OscillationsAndChaosColors.pivotStrokeColorProperty,
    lineWidth: 1.5,
    centerX: 0,
    centerY: 0,
  });
  const bob = new Circle(18, {
    fill: OscillationsAndChaosColors.mass1FillColorProperty,
    stroke: OscillationsAndChaosColors.mass1StrokeColorProperty,
    lineWidth: 2,
    centerX: endX,
    centerY: endY,
  });
  return iconFrom(centered(new Node({ children: [anchorBar(50), rod, pivot, bob] })));
}

export function createDoublePendulumIcon(): ScreenIcon {
  const rod1Length = 60;
  const rod1Angle = Math.PI / 7;
  const rod1EndX = rod1Length * Math.sin(rod1Angle);
  const rod1EndY = rod1Length * Math.cos(rod1Angle);

  const rod2Length = 55;
  const rod2Angle = -Math.PI / 4.5;
  const rod2EndX = rod1EndX + rod2Length * Math.sin(rod2Angle);
  const rod2EndY = rod1EndY + rod2Length * Math.cos(rod2Angle);

  const rod1 = new Line(0, 0, rod1EndX, rod1EndY, {
    stroke: OscillationsAndChaosColors.rodStrokeColorProperty,
    lineWidth: 2.5,
    lineCap: "round",
  });
  const rod2 = new Line(rod1EndX, rod1EndY, rod2EndX, rod2EndY, {
    stroke: OscillationsAndChaosColors.rodStrokeColorProperty,
    lineWidth: 2.5,
    lineCap: "round",
  });
  const topPivot = new Circle(4, {
    fill: OscillationsAndChaosColors.pivotFillColorProperty,
    stroke: OscillationsAndChaosColors.pivotStrokeColorProperty,
    lineWidth: 1.5,
    centerX: 0,
    centerY: 0,
  });
  const middlePivot = new Circle(3, {
    fill: OscillationsAndChaosColors.pivotFillColorProperty,
    stroke: OscillationsAndChaosColors.pivotStrokeColorProperty,
    lineWidth: 1.5,
    centerX: rod1EndX,
    centerY: rod1EndY,
  });
  const bob1 = new Circle(14, {
    fill: OscillationsAndChaosColors.mass1FillColorProperty,
    stroke: OscillationsAndChaosColors.mass1StrokeColorProperty,
    lineWidth: 2,
    centerX: rod1EndX,
    centerY: rod1EndY,
  });
  const bob2 = new Circle(14, {
    fill: OscillationsAndChaosColors.mass2FillColorProperty,
    stroke: OscillationsAndChaosColors.mass2StrokeColorProperty,
    lineWidth: 2,
    centerX: rod2EndX,
    centerY: rod2EndY,
  });

  return iconFrom(centered(new Node({ children: [anchorBar(50), rod1, rod2, topPivot, bob1, middlePivot, bob2] })));
}
