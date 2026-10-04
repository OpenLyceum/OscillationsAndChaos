/**
 * View for the Single Spring screen.
 * Displays a mass attached to a spring that can be dragged and oscillates.
 */

import { StringUtils } from "scenerystack";
import { Property } from "scenerystack/axon";
import { Range, Vector2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Line, type Node, Rectangle, RichDragListener, RichText, Text, VBox } from "scenerystack/scenery";
import { FormulaNode, PhetFont } from "scenerystack/scenery-phet";
import type { ScreenSummaryContent } from "scenerystack/sim";
import type { Preset } from "../../common/model/Preset.js";
import { constrainSpringDragPosition } from "../../common/util/constrainSpringDragPosition.js";
import SimulationAnnouncer from "../../common/util/SimulationAnnouncer.js";
import { BaseScreenView, type BaseScreenViewOptions } from "../../common/view/BaseScreenView.js";
import {
  FONT_SIZE_BODY_TEXT,
  FONT_SIZE_SCREEN_TITLE,
  FONT_SIZE_SECONDARY_LABEL,
} from "../../common/view/FontSizeConstants.js";
import type { PlottableProperty } from "../../common/view/graph/PlottableProperty.js";
import { ParameterControlPanel } from "../../common/view/ParameterControlPanel.js";
import { ParametricSpringNode } from "../../common/view/ParametricSpringNode.js";
import type { PresetOption } from "../../common/view/PresetSelectorFactory.js";
import { SpringNode } from "../../common/view/SpringNode.js";
import {
  SINGLE_SPRING_LOOPS,
  SPRING_LEFT_END_LENGTH,
  SPRING_LINE_WIDTH,
  SPRING_RADIUS,
  SPRING_RIGHT_END_LENGTH,
} from "../../common/view/SpringVisualizationConstants.js";
import { SpringVisualizationType } from "../../common/view/SpringVisualizationType.js";
import { SPACING_LARGE } from "../../common/view/UILayoutConstants.js";
import type { VectorNode } from "../../common/view/VectorNode.js";
import { VectorNodeFactory } from "../../common/view/VectorNodeFactory.js";
import { StringManager } from "../../i18n/StringManager.js";
import OscillationsAndChaosColors from "../../OscillationsAndChaosColors.js";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";
import { oscillationsAndChaosPreferences } from "../../preferences/OscillationsAndChaosPreferencesModel.js";
import type { SingleSpringModel } from "../model/SingleSpringModel.js";
import { SingleSpringPresets } from "../model/SingleSpringPresets.js";
import { SingleSpringScreenSummaryContent } from "./SingleSpringScreenSummaryContent.js";

export type SingleSpringScreenViewOptions = BaseScreenViewOptions;

export class SingleSpringScreenView extends BaseScreenView<SingleSpringModel> {
  private readonly massNode: Rectangle;
  private readonly massReferenceLine: Line; // Horizontal line showing center of mass position
  private readonly classicSpringNode: SpringNode;
  private readonly parametricSpringNode: ParametricSpringNode;
  private currentSpringNode: SpringNode | ParametricSpringNode;
  private readonly fixedPoint: Vector2;
  protected override readonly presetProperty: Property<PresetOption>;
  protected override readonly presets: Preset[];
  protected override isApplyingPreset: boolean = false;

  // Vector visualization
  private readonly velocityVectorNode: VectorNode;
  private readonly forceVectorNode: VectorNode;
  private readonly accelerationVectorNode: VectorNode;

  public constructor(model: SingleSpringModel, providedOptions?: SingleSpringScreenViewOptions) {
    const options = optionize<SingleSpringScreenViewOptions, EmptySelfOptions, BaseScreenViewOptions>()(
      {
        showVelocity: false,
        showForce: false,
        showAcceleration: false,
      },
      providedOptions,
    );
    super(model, options);

    // Get available presets
    this.presets = SingleSpringPresets.getPresets();

    // Initialize with first preset as default
    this.presetProperty = new Property<PresetOption>(this.presets[0]!);

    // Fixed point for spring attachment (top of screen, centered horizontally)
    // Position the fixed point at the wall location for proper attachment
    const wallY = 80;
    this.fixedPoint = new Vector2(this.layoutBounds.centerX, wallY);

    // Create modelViewTransform: maps model coordinates (meters) to view coordinates (pixels)
    // Maps model origin (0, 0) to the fixed point, with 50 pixels per meter
    // Positive Y model direction maps to positive Y view direction (downward)
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      this.fixedPoint,
      50, // pixels per meter
    );

    // Setup grid visualization (add early so it's behind other elements)
    this.setupGrid(0.5, this.modelViewTransform); // 0.5 meter spacing

    // Setup measurement tools (distance tool, stopwatch) - no protractor for spring screens
    this.setupMeasurementTools(this.modelViewTransform, undefined, false);

    // Wall visualization (horizontal bar at top)
    const wall = new Line(this.layoutBounds.centerX - 20, wallY, this.layoutBounds.centerX + 20, wallY, {
      stroke: OscillationsAndChaosColors.rodStrokeColorProperty,
      lineWidth: 4,
    });
    this.addChild(wall);

    // Create both spring node types (only one will be visible at a time)
    this.classicSpringNode = new SpringNode({
      loops: SINGLE_SPRING_LOOPS,
      radius: SPRING_RADIUS,
      lineWidth: SPRING_LINE_WIDTH,
      leftEndLength: SPRING_LEFT_END_LENGTH,
      rightEndLength: SPRING_RIGHT_END_LENGTH,
    });

    this.parametricSpringNode = new ParametricSpringNode({
      loops: SINGLE_SPRING_LOOPS,
      radius: SPRING_RADIUS,
      lineWidth: SPRING_LINE_WIDTH,
      leftEndLength: SPRING_LEFT_END_LENGTH,
      rightEndLength: SPRING_RIGHT_END_LENGTH,
    });

    // Keep both spring nodes in the graph and toggle visibility. Adding/removing children
    // on preference change mutates the scene graph during input/paint (insertChild at -1
    // because massNode lives on pdomPlayAreaNode, plus syncTree / EnumerationProperty reentry).
    this.addChild(this.classicSpringNode);
    this.addChild(this.parametricSpringNode);

    this.currentSpringNode =
      oscillationsAndChaosPreferences.springVisualizationTypeProperty.value === SpringVisualizationType.PARAMETRIC
        ? this.parametricSpringNode
        : this.classicSpringNode;
    this.classicSpringNode.visible = this.currentSpringNode === this.classicSpringNode;
    this.parametricSpringNode.visible = this.currentSpringNode === this.parametricSpringNode;

    // Link spring constant to visual appearance
    this.linkProperty(this.model.springConstantProperty, (k) => {
      this.updateSpringAppearance(k);
    });

    // Mass block (size will be updated based on mass value)
    // pdom - Will be added to playAreaNode later for proper PDOM structure
    this.massNode = new Rectangle(-25, -25, 50, 50, {
      fill: OscillationsAndChaosColors.mass1FillColorProperty,
      stroke: OscillationsAndChaosColors.mass1StrokeColorProperty,
      lineWidth: 2,
      cornerRadius: 3,
      cursor: "pointer",
      // pdom - Add PDOM properties for Interactive Description
      tagName: "div",
      ariaRole: "application",
      accessibleName: StringManager.getInstance().getControlAccessibleNames().massStringProperty,
      focusable: true,
      focusHighlight: "invisible",
    });
    // Note: massNode is added to playAreaNode later in constructor

    // Center of mass reference line (horizontal line across mass)
    this.massReferenceLine = new Line(0, 0, 0, 0, {
      stroke: OscillationsAndChaosColors.textColorProperty,
      lineWidth: 2,
      lineDash: [5, 3],
    });
    this.addChild(this.massReferenceLine);

    // Link mass to visual size
    this.linkProperty(this.model.massProperty, (mass) => {
      this.updateMassSize(mass);
    });

    // Add drag listener to mass with accessibility announcements
    const a11yStrings = this.getA11yStrings();
    let dragOffsetModel = 0; // Track the offset in model coordinates
    const announceMassReleased = (): void => {
      const position = StringUtils.toFixedNumberLTR(this.model.positionProperty.value, 2);
      const template = a11yStrings.massReleasedAtStringProperty.value;
      const announcement = template.replace("{{position}}", position);
      SimulationAnnouncer.announceDragInteraction(announcement);
    };
    this.addDisposableInputListener(
      this.massNode,
      new RichDragListener({
        transform: this.modelViewTransform!,
        dragListenerOptions: {
          translateNode: false,
          start: (event) => {
            const parentPoint = this.globalToLocalPoint(event.pointer.point);
            const pointerModelY = this.modelViewTransform!.viewToModelY(parentPoint.y);
            const currentModelPosition = this.model.positionProperty.value;
            dragOffsetModel = currentModelPosition - pointerModelY;
            SimulationAnnouncer.announceDragInteraction(a11yStrings.draggingMassStringProperty.value);
          },
          drag: (event) => {
            const parentPoint = this.globalToLocalPoint(event.pointer.point);
            const pointerModelY = this.modelViewTransform!.viewToModelY(parentPoint.y);
            this.model.positionProperty.value = constrainSpringDragPosition(
              this.model.positionProperty.value,
              pointerModelY + dragOffsetModel,
            );
            this.model.velocityProperty.value = 0;
          },
          end: announceMassReleased,
        },
        keyboardDragListenerOptions: {
          keyboardDragDirection: "upDown",
          dragSpeed: 80,
          shiftDragSpeed: 30,
          start: () => {
            SimulationAnnouncer.announceDragInteraction(a11yStrings.draggingMassStringProperty.value);
          },
          drag: (_event, listener) => {
            this.model.positionProperty.value = constrainSpringDragPosition(
              this.model.positionProperty.value,
              this.model.positionProperty.value + listener.modelDelta.y,
            );
            this.model.velocityProperty.value = 0;
          },
          end: announceMassReleased,
        },
      }),
    );

    // Link model position and natural length to view
    this.linkProperty(this.model.positionProperty, this.updateVisualization.bind(this));
    this.linkProperty(this.model.naturalLengthProperty, () =>
      this.updateVisualization(this.model.positionProperty.value),
    );

    // Listen to spring visualization preference changes
    // Using lazyLink to avoid triggering during initialization
    this.lazyLinkProperty(oscillationsAndChaosPreferences.springVisualizationTypeProperty, (springType) => {
      this.switchSpringVisualization(springType);
    });

    // Create vector nodes using factory
    const vectors = VectorNodeFactory.createVectorNodes();
    this.velocityVectorNode = vectors.velocity;
    this.forceVectorNode = vectors.force;
    this.accelerationVectorNode = vectors.acceleration;

    this.addChild(this.velocityVectorNode);
    this.addChild(this.forceVectorNode);
    this.addChild(this.accelerationVectorNode);

    // Link visibility properties to vector nodes
    VectorNodeFactory.linkVectorVisibility(
      vectors,
      this.showVelocityProperty,
      this.showForceProperty,
      this.showAccelerationProperty,
    );

    // Control panel
    const controlPanel = this.createControlPanel();
    this.addChild(controlPanel);

    // Listen for preset changes to apply configuration
    this.linkProperty(this.presetProperty, (preset) => {
      if (preset !== "Custom" && !this.isApplyingPreset) {
        this.applyPreset(preset);
      }
    });

    // Listen to model parameter changes to detect user modifications
    const detectCustomChange = () => {
      if (!this.isApplyingPreset && this.presetProperty.value !== "Custom") {
        this.presetProperty.value = "Custom";
      }
    };
    this.lazyLinkProperty(this.model.massProperty, detectCustomChange);
    this.lazyLinkProperty(this.model.springConstantProperty, detectCustomChange);
    this.lazyLinkProperty(this.model.dampingProperty, detectCustomChange);
    this.lazyLinkProperty(this.model.gravityProperty, detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.lazyLinkProperty(this.model.massProperty, (mass) => {
      const template = a11yStrings.massChangedStringProperty.value;
      const announcement = template.replace("{{value}}", StringUtils.toFixedNumberLTR(mass, 1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.lazyLinkProperty(this.model.springConstantProperty, (springConstant) => {
      const template = a11yStrings.springConstantChangedStringProperty.value;
      const announcement = template.replace("{{value}}", StringUtils.toFixedNumberLTR(springConstant, 0));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.lazyLinkProperty(this.model.dampingProperty, (damping) => {
      const template = a11yStrings.dampingChangedStringProperty.value;
      const announcement = template.replace("{{value}}", StringUtils.toFixedNumberLTR(damping, 1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.lazyLinkProperty(this.model.gravityProperty, (gravity) => {
      const template = a11yStrings.gravityChangedStringProperty.value;
      const announcement = template.replace("{{value}}", StringUtils.toFixedNumberLTR(gravity, 1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });

    // Apply the first preset immediately
    this.applyPreset(this.presets[0]!);

    // Create configurable graph with available properties
    const stringManager = StringManager.getInstance();
    const propertyNames = stringManager.getGraphPropertyNames();
    const availableProperties: PlottableProperty[] = [
      {
        name: propertyNames.positionStringProperty,
        property: this.model.positionProperty,
        unit: "m",
      },
      {
        name: propertyNames.velocityStringProperty,
        property: this.model.velocityProperty,
        unit: "m/s",
      },
      {
        name: propertyNames.accelerationStringProperty,
        property: this.model.accelerationProperty,
        unit: "m/s²",
      },
      {
        name: propertyNames.kineticEnergyStringProperty,
        property: this.model.kineticEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.potentialEnergyStringProperty,
        property: this.model.potentialEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.springPotentialEnergyStringProperty,
        property: this.model.springPotentialEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.gravitationalPotentialEnergyStringProperty,
        property: this.model.gravitationalPotentialEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.totalEnergyStringProperty,
        property: this.model.totalEnergyProperty,
        unit: "J",
      },
      {
        name: propertyNames.timeStringProperty,
        property: this.model.timeProperty,
        unit: "s",
      },
    ];

    // Setup the configurable graph (position vs time by default)
    this.setupConfigurableGraph(availableProperties, 0);
    this.addChild(this.configurableGraph!);

    // Position control panel at the top right
    controlPanel.right = this.layoutBounds.maxX - 10;
    controlPanel.top = this.layoutBounds.minY + 10;

    // Setup vector and tools panels using base class method (no protractor for spring screens)
    this.setupVectorAndToolsPanels(false);

    // Position graph beneath vector panel
    this.positionConfigurableGraph(this.vectorPanel!);

    // pdom - Setup screen summary for Interactive Description
    this.setupScreenSummary();

    // pdom - Add mass to play area for proper PDOM organization
    this.pdomPlayAreaNode.addChild(this.massNode);

    // Setup common controls (time controls, reset button, info button, keyboard shortcuts)
    this.setupCommonControls();

    // Manage z-order using base class method
    this.manageZOrder(
      [this.classicSpringNode, this.parametricSpringNode, this.massNode, this.massReferenceLine],
      [this.velocityVectorNode, this.forceVectorNode, this.accelerationVectorNode],
    );

    // Initial visualization
    this.updateVisualization(this.model.positionProperty.value);
  }

  /**
   * Create the control panel with parameter sliders.
   */
  private createControlPanel(): Node {
    const stringManager = StringManager.getInstance();
    const controlLabels = stringManager.getControlLabels();
    const presetLabels = stringManager.getPresetLabels();

    return new ParameterControlPanel({
      presetProperty: this.presetProperty,
      presets: this.presets,
      customLabelProperty: presetLabels.customStringProperty,
      presetLabelProperty: presetLabels.labelStringProperty,
      listParent: this,
      parameters: [
        {
          labelProperty: controlLabels.massStringProperty,
          property: this.model.massProperty,
          range: new Range(0.1, 5.0),
          delta: 0.1,
          decimalPlaces: 1,
          unit: "kg",
        },
        {
          labelProperty: controlLabels.springConstantStringProperty,
          property: this.model.springConstantProperty,
          range: new Range(1.0, 50.0),
          delta: 1.0,
          decimalPlaces: 0,
          unit: "N/m",
        },
        {
          labelProperty: controlLabels.dampingStringProperty,
          property: this.model.dampingProperty,
          range: new Range(0.0, 20.0),
          delta: 0.5,
          decimalPlaces: 1,
          unit: "N·s/m",
        },
        {
          labelProperty: controlLabels.gravityStringProperty,
          property: this.model.gravityProperty,
          range: new Range(0.0, 20.0),
          delta: 0.1,
          decimalPlaces: 1,
          unit: "m/s²",
        },
      ],
    });
  }

  /**
   * Switch between classic and parametric spring visualization without mutating children.
   */
  private switchSpringVisualization(springType: SpringVisualizationType): void {
    this.currentSpringNode =
      springType === SpringVisualizationType.PARAMETRIC ? this.parametricSpringNode : this.classicSpringNode;
    this.classicSpringNode.visible = this.currentSpringNode === this.classicSpringNode;
    this.parametricSpringNode.visible = this.currentSpringNode === this.parametricSpringNode;

    this.updateSpringAppearance(this.model.springConstantProperty.value);
    this.updateVisualization(this.model.positionProperty.value);
  }

  /**
   * pdom - Create the screen summary content for accessibility
   */
  protected createScreenSummaryContent(): ScreenSummaryContent {
    return new SingleSpringScreenSummaryContent(this.model);
  }

  /**
   * Create the content for the info dialog.
   */
  protected createInfoDialogContent(): Node {
    // Create formula nodes
    const equation = new FormulaNode("m \\frac{d^2 x}{d t^2} = -kx - b \\frac{dx}{dt} + mg", {
      maxWidth: 700,
    });
    const variablesList = new FormulaNode(
      "\\begin{array}{l}" +
        "\\bullet\\; m = \\text{mass (kg)}\\\\" +
        "\\bullet\\; k = \\text{spring constant (N/m)}\\\\" +
        "\\bullet\\; b = \\text{damping coefficient (N}\\cdot\\text{s/m)}\\\\" +
        "\\bullet\\; x = \\text{displacement from equilibrium (m)}\\\\" +
        "\\bullet\\; g = \\text{gravitational acceleration (m/s}^2\\text{)}" +
        "\\end{array}",
      {
        maxWidth: 700,
      },
    );

    // Link text color property to formula nodes
    // FormulaNode extends DOM, so we need to set the color via CSS
    this.linkProperty(OscillationsAndChaosColors.textColorProperty, (color) => {
      equation.element.style.color = color.toCSS();
      variablesList.element.style.color = color.toCSS();
    });

    const infoPanelStrings = StringManager.getInstance().getInfoPanelStrings();
    return new VBox({
      spacing: SPACING_LARGE,
      align: "left",
      children: [
        new Text(infoPanelStrings.singleSpringTitleStringProperty, {
          font: new PhetFont({ size: FONT_SIZE_SCREEN_TITLE, weight: "bold" }),
          fill: OscillationsAndChaosColors.textColorProperty,
        }),
        new RichText(infoPanelStrings.singleSpringDescriptionStringProperty, {
          font: new PhetFont({ size: FONT_SIZE_SECONDARY_LABEL }),
          fill: OscillationsAndChaosColors.textColorProperty,
          maxWidth: 700,
        }),
        new Text(infoPanelStrings.equationOfMotionLabelStringProperty, {
          font: new PhetFont({ size: FONT_SIZE_SECONDARY_LABEL, weight: "bold" }),
          fill: OscillationsAndChaosColors.textColorProperty,
        }),
        equation,
        new Text(infoPanelStrings.whereLabelStringProperty, {
          font: new PhetFont({ size: FONT_SIZE_BODY_TEXT }),
          fill: OscillationsAndChaosColors.textColorProperty,
        }),
        variablesList,
      ],
    });
  }

  /**
   * Update the visual representation based on current position.
   */
  private updateVisualization(position: number): void {
    // Convert model position to view coordinates
    // Position is displacement from natural length (positive downward)
    // Total length from fixed point = natural length + displacement
    const naturalLength = this.model.naturalLengthProperty.value;
    const totalLength = naturalLength + position;
    const modelPosition = new Vector2(0, totalLength);
    const viewPosition = this.modelViewTransform!.modelToViewPosition(modelPosition);

    // Update mass position
    this.massNode.center = viewPosition;

    // Update center of mass reference line (horizontal line across the mass)
    const massHalfWidth = this.massNode.width / 2;
    this.massReferenceLine.setLine(
      viewPosition.x - massHalfWidth,
      viewPosition.y,
      viewPosition.x + massHalfWidth,
      viewPosition.y,
    );

    // Update spring endpoints (vertical spring from fixed point to top of mass)
    // Account for the mass height which varies with mass value
    const massHalfHeight = this.massNode.height / 2;
    this.currentSpringNode.setEndpoints(
      this.fixedPoint,
      new Vector2(viewPosition.x, viewPosition.y - massHalfHeight), // Connect to top edge of mass
    );
  }

  /**
   * Update spring appearance based on spring constant.
   * Stiffer springs (higher k) appear with thicker lines.
   */
  private updateSpringAppearance(springConstant: number): void {
    // Map spring constant [1, 50] to lineWidth [1, 2.5]
    const minK = 1,
      maxK = 50;
    const minLineWidth = 1,
      maxLineWidth = 2.5;
    const lineWidth = minLineWidth + ((springConstant - minK) * (maxLineWidth - minLineWidth)) / (maxK - minK);

    this.currentSpringNode.setLineWidth(lineWidth);
  }

  /**
   * Update mass block size based on mass value.
   * Larger masses appear as larger blocks.
   */
  private updateMassSize(mass: number): void {
    // Map mass [0.1, 5.0] kg to size [30, 70] pixels
    const minMass = 0.1,
      maxMass = 5.0;
    const minSize = 30,
      maxSize = 70;
    const size = minSize + ((mass - minMass) * (maxSize - minSize)) / (maxMass - minMass);

    // Update rectangle dimensions (keeping it centered)
    this.massNode.setRect(-size / 2, -size / 2, size, size);

    // Update visualization to reconnect spring to new mass size
    this.updateVisualization(this.model.positionProperty.value);
  }

  public override reset(): void {
    super.reset(); // Reset base view properties (including vector visibility properties and graph)

    // Update visualization to match reset model state
    this.updateVisualization(this.model.positionProperty.value);
  }

  public override step(dt: number): void {
    super.step(dt); // Step the stopwatch, graph, and other base view components

    // Update vector visualizations
    this.updateVectors();
  }

  /**
   * Update vector positions and magnitudes based on current model state
   */
  private updateVectors(): void {
    // Get current model state
    const position = this.model.positionProperty.value;
    const velocity = this.model.velocityProperty.value;
    const mass = this.model.massProperty.value;
    const k = this.model.springConstantProperty.value;
    const b = this.model.dampingProperty.value;
    const g = this.model.gravityProperty.value;

    // Calculate forces (positive downward)
    const springForce = -k * position;
    const dampingForce = -b * velocity;
    const gravityForce = mass * g;
    const totalForce = springForce + dampingForce + gravityForce;

    // Calculate acceleration
    const acceleration = totalForce / mass;

    // Get mass center position in view coordinates
    const massCenter = this.massNode.center;

    // Update velocity vector (vertical, pointing in direction of motion)
    // Offset to the left of center to avoid overlap
    this.velocityVectorNode.setTailPosition(massCenter.plusXY(-15, 0));
    this.velocityVectorNode.setVector(new Vector2(0, velocity));

    // Update acceleration vector (vertical)
    // Offset to the right of center
    this.accelerationVectorNode.setTailPosition(massCenter.plusXY(10, 0));
    this.accelerationVectorNode.setVector(new Vector2(0, acceleration));

    // Update net force vector (vertical)
    // Offset further to the right to avoid overlap with acceleration
    this.forceVectorNode.setTailPosition(massCenter.plusXY(25, 0));
    this.forceVectorNode.setVector(new Vector2(0, totalForce));
  }

  /**
   * Apply a preset configuration to the model
   */
  private applyPreset(preset: Preset): void {
    this.isApplyingPreset = true;

    const config = preset.configuration;

    // Apply all configuration values to model properties
    if (config["mass"] !== undefined) {
      this.model.massProperty.value = config["mass"];
    }
    if (config["springConstant"] !== undefined) {
      this.model.springConstantProperty.value = config["springConstant"];
    }
    if (config["damping"] !== undefined) {
      this.model.dampingProperty.value = config["damping"];
    }
    if (config["position"] !== undefined) {
      this.model.positionProperty.value = config["position"];
    }

    // Reset velocity when applying preset
    this.model.velocityProperty.value = 0;

    // Reset simulation time only (don't reset the parameters we just set!)
    this.restartModelTime();

    // Clear the graph when switching presets (if it exists)
    if (this.configurableGraph) {
      this.configurableGraph.clearData();
    }

    // Announce preset change
    const a11yStrings = this.getA11yStrings();
    const template = a11yStrings.presetAppliedStringProperty.value;
    const announcement = template.replace("{{preset}}", preset.nameProperty.value);
    SimulationAnnouncer.announceParameterChange(announcement);

    this.isApplyingPreset = false;
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register("SingleSpringScreenView", SingleSpringScreenView);
