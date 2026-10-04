/**
 * View for the Pendulum screen.
 * Displays a pendulum that can be dragged and swings.
 */

import { PhetFont, StringUtils } from "scenerystack";
import { BooleanProperty, Property } from "scenerystack/axon";
import { Range, Vector2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, Line, type Node, RichDragListener, RichText, Text, VBox } from "scenerystack/scenery";
import { FormulaNode } from "scenerystack/scenery-phet";
import type { ScreenSummaryContent } from "scenerystack/sim";
import type { Preset } from "../../common/model/Preset.js";
import SimulationAnnouncer from "../../common/util/SimulationAnnouncer.js";
import { BaseScreenView, type BaseScreenViewOptions } from "../../common/view/BaseScreenView.js";
import {
  FONT_SIZE_BODY_TEXT,
  FONT_SIZE_SCREEN_TITLE,
  FONT_SIZE_SECONDARY_LABEL,
} from "../../common/view/FontSizeConstants.js";
import type { PlottableProperty } from "../../common/view/graph/PlottableProperty.js";
import { ParameterControlPanel } from "../../common/view/ParameterControlPanel.js";
import { PendulumLabProtractorNode } from "../../common/view/PendulumLabProtractorNode.js";
import type { PresetOption } from "../../common/view/PresetSelectorFactory.js";
import { SPACING_LARGE } from "../../common/view/UILayoutConstants.js";
import type { VectorNode } from "../../common/view/VectorNode.js";
import { VectorNodeFactory } from "../../common/view/VectorNodeFactory.js";
import { StringManager } from "../../i18n/StringManager.js";
import OscillationsAndChaosColors from "../../OscillationsAndChaosColors.js";
import OscillationsAndChaosNamespace from "../../OscillationsAndChaosNamespace.js";
import type { PendulumModel } from "../model/PendulumModel.js";
import { PendulumPresets } from "../model/PendulumPresets.js";
import { PendulumScreenSummaryContent } from "./PendulumScreenSummaryContent.js";

export type PendulumScreenViewOptions = BaseScreenViewOptions;

export class PendulumScreenView extends BaseScreenView<PendulumModel> {
  private readonly bobNode: Circle;
  private readonly bobReferenceDot: Circle; // Small dot showing center of mass position
  private readonly rodNode: Line;
  private readonly pivotNode: Circle;
  private readonly pivotPoint: Vector2;
  protected override readonly presetProperty: Property<PresetOption>;
  protected override readonly presets: Preset[];
  protected override isApplyingPreset: boolean = false;

  // Vector visualization
  private readonly velocityVectorNode: VectorNode;
  private readonly forceVectorNode: VectorNode;
  private readonly accelerationVectorNode: VectorNode;

  // Dragging state for protractor
  private readonly isDraggingProperty: BooleanProperty;

  // Accessibility strings
  private readonly a11yStrings: ReturnType<StringManager["getA11yStrings"]>;
  private readonly stringManager: StringManager;

  public constructor(model: PendulumModel, providedOptions?: PendulumScreenViewOptions) {
    const options = optionize<PendulumScreenViewOptions, EmptySelfOptions, BaseScreenViewOptions>()(
      {},
      providedOptions,
    );
    super(model, options);

    // Get available presets
    this.presets = PendulumPresets.getPresets();

    // Get accessibility strings for announcements
    this.stringManager = StringManager.getInstance();
    this.a11yStrings = this.stringManager.getA11yStrings();

    // Initialize with first preset as default
    this.presetProperty = new Property<PresetOption>(this.presets[0]!);

    // Pivot point (top center of screen)
    this.pivotPoint = new Vector2(this.layoutBounds.centerX, this.layoutBounds.minY + 100);

    // Create modelViewTransform: maps model coordinates (meters) to view coordinates (pixels)
    // Maps model origin (0, 0) to the pivot point, with 100 pixels per meter
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      this.pivotPoint,
      100, // pixels per meter
    );

    // Setup grid visualization (add early so it's behind other elements)
    this.setupGrid(0.5, this.modelViewTransform); // 0.5 meter spacing

    // Initialize dragging state
    this.isDraggingProperty = new BooleanProperty(false);

    // Setup measurement tools (distance tool, stopwatch)
    // We'll set up the protractor separately with the PendulumLabProtractorNode
    this.setupMeasurementTools(this.modelViewTransform, this.pivotPoint);

    // Replace the generic protractor with the PendulumLabProtractorNode
    if (this.protractorNode) {
      this.removeChild(this.protractorNode);
    }

    // Create the PendulumLabProtractorNode
    const pendulumLabProtractor = new PendulumLabProtractorNode(
      {
        angleProperty: this.model.angleProperty,
        isDraggingProperty: this.isDraggingProperty,
        color: OscillationsAndChaosColors.mass1FillColorProperty.value.toCSS(),
        lengthProperty: this.model.lengthProperty,
      },
      this.modelViewTransform,
    );
    this.protractorNode = pendulumLabProtractor;
    this.addChild(pendulumLabProtractor);

    // Link visibility
    this.linkProperty(this.showProtractorProperty, (visible: boolean) => {
      pendulumLabProtractor.visible = visible;
    });

    // Pivot
    this.pivotNode = new Circle(8, {
      fill: OscillationsAndChaosColors.pivotFillColorProperty,
      stroke: OscillationsAndChaosColors.pivotStrokeColorProperty,
      lineWidth: 2,
    });
    this.pivotNode.center = this.pivotPoint;
    this.addChild(this.pivotNode);

    // Rod
    this.rodNode = new Line(0, 0, 0, 0, {
      stroke: OscillationsAndChaosColors.rodStrokeColorProperty,
      lineWidth: 4,
      lineCap: "round",
    });
    this.addChild(this.rodNode);

    // Bob (size will be updated based on mass value)
    // pdom - Will be added to playAreaNode later for proper PDOM structure
    this.bobNode = new Circle(20, {
      fill: OscillationsAndChaosColors.mass1FillColorProperty,
      stroke: OscillationsAndChaosColors.mass1StrokeColorProperty,
      lineWidth: 2,
      cursor: "pointer",
      // pdom - Add PDOM properties for Interactive Description
      tagName: "div",
      ariaRole: "application",
      accessibleName: StringManager.getInstance().getControlAccessibleNames().pendulumBobStringProperty,
      focusable: true,
      focusHighlight: "invisible",
    });
    // Note: bobNode is added to playAreaNode later in constructor

    // Center of mass reference dot (small circle at center of bob)
    this.bobReferenceDot = new Circle(3, {
      fill: OscillationsAndChaosColors.textColorProperty,
      stroke: OscillationsAndChaosColors.referenceDotStrokeColorProperty,
    });
    this.addChild(this.bobReferenceDot);

    // Link mass to visual size
    this.linkProperty(this.model.massProperty, (mass) => {
      this.updateBobSize(mass);
    });

    // Drag listener for bob with accessibility announcements
    const announceBobReleased = (): void => {
      this.isDraggingProperty.value = false;
      const angleDegrees = StringUtils.toFixedNumberLTR((this.model.angleProperty.value * 180) / Math.PI, 1);
      const template = this.a11yStrings.bobReleasedAtStringProperty.value;
      const announcement = template.replace("{{angle}}", angleDegrees);
      SimulationAnnouncer.announceDragInteraction(announcement);
    };
    this.addDisposableInputListener(
      this.bobNode,
      new RichDragListener({
        dragListenerOptions: {
          translateNode: false,
          start: () => {
            this.isDraggingProperty.value = true;
            SimulationAnnouncer.announceDragInteraction("Dragging pendulum bob");
          },
          drag: (event) => {
            const parentPoint = this.globalToLocalPoint(event.pointer.point);
            const delta = parentPoint.minus(this.pivotPoint);
            const angle = Math.atan2(delta.x, delta.y); // angle from vertical
            this.model.angleProperty.value = angle;
            this.model.angularVelocityProperty.value = 0;
          },
          end: announceBobReleased,
        },
        keyboardDragListenerOptions: {
          keyboardDragDirection: "leftRight",
          dragDelta: 0.05,
          shiftDragDelta: 0.01,
          start: () => {
            this.isDraggingProperty.value = true;
            SimulationAnnouncer.announceDragInteraction("Dragging pendulum bob");
          },
          drag: (_event, listener) => {
            this.model.angleProperty.value += listener.modelDelta.x;
            this.model.angularVelocityProperty.value = 0;
          },
          end: announceBobReleased,
        },
      }),
    );

    // Link model to view
    this.linkProperty(this.model.angleProperty, this.updateVisualization.bind(this));
    this.linkProperty(this.model.lengthProperty, this.updateVisualization.bind(this));

    // Initialize vector visibility properties (from base class)
    this.showVelocityProperty.setInitialValue(true);
    this.showForceProperty.setInitialValue(true);
    this.showAccelerationProperty.setInitialValue(false);

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
    this.lazyLinkProperty(this.model.lengthProperty, detectCustomChange);
    this.lazyLinkProperty(this.model.massProperty, detectCustomChange);
    this.lazyLinkProperty(this.model.gravityProperty, detectCustomChange);
    this.lazyLinkProperty(this.model.dampingProperty, detectCustomChange);

    // Add accessibility announcements for parameter changes
    this.lazyLinkProperty(this.model.lengthProperty, (length) => {
      const template = this.a11yStrings.lengthChangedStringProperty.value;
      const announcement = template.replace("{{value}}", StringUtils.toFixedNumberLTR(length, 1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.lazyLinkProperty(this.model.massProperty, (mass) => {
      const template = this.a11yStrings.massChangedStringProperty.value;
      const announcement = template.replace("{{value}}", StringUtils.toFixedNumberLTR(mass, 1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.lazyLinkProperty(this.model.gravityProperty, (gravity) => {
      const template = this.a11yStrings.gravityChangedStringProperty.value;
      const announcement = template.replace("{{value}}", StringUtils.toFixedNumberLTR(gravity, 1));
      SimulationAnnouncer.announceParameterChange(announcement);
    });
    this.lazyLinkProperty(this.model.dampingProperty, (damping) => {
      const template = this.a11yStrings.dampingChangedStringProperty.value;
      const announcement = template.replace("{{value}}", StringUtils.toFixedNumberLTR(damping, 2));
      SimulationAnnouncer.announceParameterChange(announcement);
    });

    // Apply the first preset immediately
    this.applyPreset(this.presets[0]!);

    // Create configurable graph with available properties
    const propertyNames = this.stringManager.getGraphPropertyNames();
    const availableProperties: PlottableProperty[] = [
      {
        name: propertyNames.angleStringProperty,
        property: this.model.angleProperty,
        unit: "rad",
      },
      {
        name: propertyNames.angularVelocityStringProperty,
        property: this.model.angularVelocityProperty,
        unit: "rad/s",
      },
      {
        name: propertyNames.angularAccelerationStringProperty,
        property: this.model.angularAccelerationProperty,
        unit: "rad/s²",
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

    // Setup the configurable graph (angle vs time by default)
    this.setupConfigurableGraph(availableProperties, 0);
    this.addChild(this.configurableGraph!);

    // Position control panel at the top right
    controlPanel.right = this.layoutBounds.maxX - 10;
    controlPanel.top = this.layoutBounds.minY + 10;

    // Setup vector and tools panels using base class method (includes protractor for pendulum)
    this.setupVectorAndToolsPanels(true);

    // Position graph beneath vector panel
    this.positionConfigurableGraph(this.vectorPanel!);

    // pdom - Setup screen summary for Interactive Description
    this.setupScreenSummary();

    // pdom - Add bob to play area for proper PDOM organization
    this.pdomPlayAreaNode.addChild(this.bobNode);

    // Setup common controls (time controls, reset button, info button, keyboard shortcuts)
    this.setupCommonControls();

    // Manage z-order using base class method
    this.manageZOrder(
      [this.pivotNode, this.rodNode, this.bobNode, this.bobReferenceDot],
      [this.velocityVectorNode, this.forceVectorNode, this.accelerationVectorNode],
    );

    // Initial visualization
    this.updateVisualization();
  }

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
          labelProperty: controlLabels.lengthStringProperty,
          property: this.model.lengthProperty,
          range: new Range(0.5, 3.0),
          delta: 0.1,
          decimalPlaces: 1,
          unit: "m",
        },
        {
          labelProperty: controlLabels.dampingStringProperty,
          property: this.model.dampingProperty,
          range: new Range(0.0, 2.0),
          delta: 0.05,
          decimalPlaces: 2,
          unit: "N·m·s",
        },
        {
          labelProperty: controlLabels.gravityStringProperty,
          property: this.model.gravityProperty,
          range: new Range(0.0, 20.0),
          delta: 0.5,
          decimalPlaces: 1,
          unit: "m/s²",
        },
      ],
    });
  }

  /**
   * Create the content for the info dialog.
   */
  protected createInfoDialogContent(): Node {
    // Create formula nodes
    const equation = new FormulaNode("I \\frac{d^2 \\theta}{d t^2} = -mgl \\sin(\\theta) - b \\frac{d\\theta}{dt}", {
      maxWidth: 700,
    });
    const variablesList = new FormulaNode(
      "\\begin{array}{l}" +
        "\\bullet\\; I = ml^2 = \\text{moment of inertia (kg}\\cdot\\text{m}^2\\text{)}\\\\" +
        "\\bullet\\; m = \\text{mass (kg)}\\\\" +
        "\\bullet\\; l = \\text{length (m)}\\\\" +
        "\\bullet\\; g = \\text{gravitational acceleration (m/s}^2\\text{)}\\\\" +
        "\\bullet\\; b = \\text{damping coefficient (N}\\cdot\\text{m}\\cdot\\text{s)}\\\\" +
        "\\bullet\\; \\theta = \\text{angle from vertical (rad)}" +
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
        new Text(infoPanelStrings.pendulumTitleStringProperty, {
          font: new PhetFont({ size: FONT_SIZE_SCREEN_TITLE, weight: "bold" }),
          fill: OscillationsAndChaosColors.textColorProperty,
        }),
        new RichText(infoPanelStrings.pendulumDescriptionStringProperty, {
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
   * pdom - Create the screen summary content for accessibility
   */
  protected createScreenSummaryContent(): ScreenSummaryContent {
    return new PendulumScreenSummaryContent(this.model);
  }

  private updateVisualization(): void {
    const angle = this.model.angleProperty.value;
    const length = this.model.lengthProperty.value;

    // Calculate bob position in model coordinates (angle is from vertical)
    const modelBobX = length * Math.sin(angle);
    const modelBobY = length * Math.cos(angle);
    const modelBobPosition = new Vector2(modelBobX, modelBobY);

    // Convert to view coordinates
    const viewBobPosition = this.modelViewTransform!.modelToViewPosition(modelBobPosition);

    // Update bob position
    this.bobNode.center = viewBobPosition;

    // Update center of mass reference dot (position at center of bob)
    this.bobReferenceDot.center = viewBobPosition;

    // Update rod
    this.rodNode.setLine(this.pivotPoint.x, this.pivotPoint.y, viewBobPosition.x, viewBobPosition.y);
  }

  /**
   * Update bob size based on mass value.
   * Larger masses appear as larger bobs.
   */
  private updateBobSize(mass: number): void {
    // Map mass [0.1, 5.0] kg to radius [12, 35] pixels
    const minMass = 0.1,
      maxMass = 5.0;
    const minRadius = 12,
      maxRadius = 35;
    const radius = minRadius + ((mass - minMass) * (maxRadius - minRadius)) / (maxMass - minMass);

    // Update circle radius
    this.bobNode.radius = radius;

    // Update visualization to ensure bob is positioned correctly
    this.updateVisualization();
  }

  public override reset(): void {
    super.reset(); // Reset base view properties (including vector visibility properties and graph)

    // Update visualization to match reset model state
    this.updateVisualization();
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
    const angle = this.model.angleProperty.value;
    const omega = this.model.angularVelocityProperty.value;
    const L = this.model.lengthProperty.value;
    const m = this.model.massProperty.value;
    const g = this.model.gravityProperty.value;
    const b = this.model.dampingProperty.value;

    // Calculate bob position
    const modelBobX = L * Math.sin(angle);
    const modelBobY = L * Math.cos(angle);
    const modelBobPosition = new Vector2(modelBobX, modelBobY);
    const viewBobPosition = this.modelViewTransform!.modelToViewPosition(modelBobPosition);

    // Calculate tangential direction (perpendicular to rod)
    const tangentX = Math.cos(angle); // perpendicular to rod direction
    const tangentY = Math.sin(angle);

    // Tangential velocity: v = L * ω (in tangential direction)
    const vMagnitude = L * Math.abs(omega);
    const velocitySign = omega >= 0 ? 1 : -1;
    const velocityVector = new Vector2(tangentX * vMagnitude * velocitySign, tangentY * vMagnitude * velocitySign);

    // Angular acceleration: α = -(g/L)*sin(θ) - (b/mL²)*ω
    const I = m * L * L;
    const alpha = -(g / L) * Math.sin(angle) - (b / I) * omega;

    // Tangential acceleration: a = L * α
    const aMagnitude = L * Math.abs(alpha);
    const accelSign = alpha >= 0 ? 1 : -1;
    const accelerationVector = new Vector2(tangentX * aMagnitude * accelSign, tangentY * aMagnitude * accelSign);

    // Net tangential force: F = m * a
    const forceVector = accelerationVector.times(m);

    // Update vectors
    this.velocityVectorNode.setTailPosition(viewBobPosition);
    this.velocityVectorNode.setVector(velocityVector);

    this.forceVectorNode.setTailPosition(viewBobPosition);
    this.forceVectorNode.setVector(forceVector);

    this.accelerationVectorNode.setTailPosition(viewBobPosition);
    this.accelerationVectorNode.setVector(accelerationVector);
  }

  /**
   * Apply a preset configuration to the model
   */
  private applyPreset(preset: Preset): void {
    this.isApplyingPreset = true;

    const config = preset.configuration;

    // Apply all configuration values to model properties
    if (config["length"] !== undefined) {
      this.model.lengthProperty.value = config["length"];
    }
    if (config["mass"] !== undefined) {
      this.model.massProperty.value = config["mass"];
    }
    if (config["gravity"] !== undefined) {
      this.model.gravityProperty.value = config["gravity"];
    }
    if (config["damping"] !== undefined) {
      this.model.dampingProperty.value = config["damping"];
    }
    if (config["angle"] !== undefined) {
      this.model.angleProperty.value = config["angle"];
    }

    // Reset angular velocity when applying preset
    this.model.angularVelocityProperty.value = 0;

    // Reset simulation time only (don't reset the parameters we just set!)
    this.restartModelTime();

    // Clear graph when switching presets (if it exists)
    if (this.configurableGraph) {
      this.configurableGraph.clearData();
    }

    // Announce preset change
    const angleDegrees = StringUtils.toFixedNumberLTR(((config["angle"] || 0) * 180) / Math.PI, 1);
    const template = this.a11yStrings.presetAppliedStringProperty.value;
    const announcement = template.replace(
      "{{preset}}",
      `${preset.nameProperty.value}. Pendulum set to ${angleDegrees} degrees`,
    );
    SimulationAnnouncer.announceParameterChange(announcement);

    this.isApplyingPreset = false;
  }
}

// Register with namespace for debugging accessibility
OscillationsAndChaosNamespace.register("PendulumScreenView", PendulumScreenView);
