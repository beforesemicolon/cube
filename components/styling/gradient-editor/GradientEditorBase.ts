import { bool, clamp, finite, scalarText } from '../../core/value.js'
import { FieldControlBase, type FieldControlProps } from '../../form/FormControlBase.js'
import { normalizeColor, parseHexColor } from '../color-picker/color.js'
import {
    defaultGradientStops, normalizeGradientModel, normalizeGradientStops, parseGradient, serializeGradient,
    type GradientExtent, type GradientModel, type GradientPosition, type GradientShape, type GradientStop,
    type GradientStopInput, type GradientType,
} from './gradient.js'

export interface GradientEditorProps extends FieldControlProps {
    value?: string
    type?: GradientType
    angle?: number
    shape?: GradientShape
    extent?: GradientExtent
    position?: GradientPosition
    stops?: readonly GradientStopInput[]
    allowAlpha?: boolean
    allowSampler?: boolean
    swatches?: readonly string[]
    typeLabel?: string
    linearLabel?: string
    radialLabel?: string
    angleLabel?: string
    shapeLabel?: string
    circleLabel?: string
    ellipseLabel?: string
    extentLabel?: string
    closestSideLabel?: string
    closestCornerLabel?: string
    farthestSideLabel?: string
    farthestCornerLabel?: string
    positionLabel?: string
    topLeftLabel?: string
    topLabel?: string
    topRightLabel?: string
    leftLabel?: string
    centerLabel?: string
    rightLabel?: string
    bottomLeftLabel?: string
    bottomLabel?: string
    bottomRightLabel?: string
    stopsLabel?: string
    stopLabel?: string
    addStopLabel?: string
    removeStopLabel?: string
    helpText?: string
    hueLabel?: string
    saturationLabel?: string
    brightnessLabel?: string
    alphaLabel?: string
    redLabel?: string
    greenLabel?: string
    blueLabel?: string
    hexLabel?: string
    planeLabel?: string
    samplerLabel?: string
    closeLabel?: string
    swatchesLabel?: string
    addSwatchLabel?: string
    removeSwatchLabel?: string
    transparentLabel?: string
}

export interface GradientChangeDetail extends GradientModel {
    readonly value: string
    readonly previousValue: string
    readonly selectedStopId: string
    readonly originalEvent?: Event
}

/** Renderer-independent CSS gradient model and stop editing behavior. */
export abstract class GradientEditorBase extends FieldControlBase<GradientEditorProps> {
    static observedAttributes = [
        ...FieldControlBase.observedAttributes, 'value', 'type', 'angle', 'shape', 'extent', 'position', 'stops', 'allow-alpha', 'allow-sampler', 'swatches',
        'type-label', 'linear-label', 'radial-label', 'angle-label', 'shape-label', 'circle-label', 'ellipse-label', 'extent-label',
        'closest-side-label', 'closest-corner-label', 'farthest-side-label', 'farthest-corner-label', 'position-label',
        'top-left-label', 'top-label', 'top-right-label', 'left-label', 'center-label', 'right-label', 'bottom-left-label', 'bottom-label', 'bottom-right-label',
        'stops-label', 'stop-label', 'add-stop-label', 'remove-stop-label', 'help-text',
        'hue-label', 'saturation-label', 'brightness-label', 'alpha-label', 'red-label', 'green-label', 'blue-label', 'hex-label', 'plane-label',
        'sampler-label', 'close-label', 'swatches-label', 'add-swatch-label', 'remove-swatch-label', 'transparent-label',
    ]

    value = ''
    type: GradientType = 'linear'
    angle = 90
    shape: GradientShape = 'circle'
    extent: GradientExtent = 'farthest-corner'
    position: GradientPosition = 'center'
    stops: readonly GradientStopInput[] = defaultGradientStops.map(stop => ({ ...stop }))
    allowAlpha = true
    allowSampler = true
    swatches: readonly string[] = []
    typeLabel = ''
    linearLabel = ''
    radialLabel = ''
    angleLabel = ''
    shapeLabel = ''
    circleLabel = ''
    ellipseLabel = ''
    extentLabel = ''
    closestSideLabel = ''
    closestCornerLabel = ''
    farthestSideLabel = ''
    farthestCornerLabel = ''
    positionLabel = ''
    topLeftLabel = ''
    topLabel = ''
    topRightLabel = ''
    leftLabel = ''
    centerLabel = ''
    rightLabel = ''
    bottomLeftLabel = ''
    bottomLabel = ''
    bottomRightLabel = ''
    stopsLabel = ''
    stopLabel = ''
    addStopLabel = ''
    removeStopLabel = ''
    helpText = ''
    hueLabel = ''
    saturationLabel = ''
    brightnessLabel = ''
    alphaLabel = ''
    redLabel = ''
    greenLabel = ''
    blueLabel = ''
    hexLabel = ''
    planeLabel = ''
    samplerLabel = ''
    closeLabel = ''
    swatchesLabel = ''
    addSwatchLabel = ''
    removeSwatchLabel = ''
    transparentLabel = ''

    private selectedId = ''
    private stopSequence = 0

    protected mount(): void {
        this.adoptValue()
        this.ensureSelectedStop()
        super.mount()
    }

    protected update(name: string): void {
        if (name === 'value') this.adoptValue()
        this.ensureSelectedStop()
        super.update(name)
    }

    protected captureValue(): string { return this.cssValue() }
    protected serializedValue():string{return this.cssValue()}
    protected restoreValue(value: string | File | FormData | null): void {
        const restored = value instanceof FormData ? value.get(this.name) : value
        if (typeof restored === 'string') { this.value = restored; this.adoptValue() }
    }

    protected model = (): GradientModel => {
        return normalizeGradientModel({ type: this.type, angle: this.angle, shape: this.shape, extent: this.extent, position: this.position, stops: this.stops })
    }

    protected cssValue = (): string => { return serializeGradient(this.model()) }
    protected selectedStop = (): GradientStop => { return this.model().stops.find(stop => stop.id === this.selectedId) ?? this.model().stops[0] ?? defaultGradientStops[0]! }
    protected selectedStopId(): string { return this.selectedStop().id }

    protected selectStop(id: string, originalEvent?: Event): boolean {
        const stop = this.model().stops.find(candidate => candidate.id === id)
        if (!stop || this.unavailable) return false
        this.selectedId = stop.id
        this.syncView()
        this.emit('stopselect', { stop, originalEvent })
        return true
    }

    protected addStop(position: number, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const model = this.model()
        const normalizedPosition = Math.round(clamp(position, 0, 100) * 10) / 10
        const nearest = [...model.stops].sort((left, right) => Math.abs(left.position - normalizedPosition) - Math.abs(right.position - normalizedPosition))[0]
        const stop: GradientStop = { id: this.nextStopId(), color: nearest?.color ?? '#808080', position: normalizedPosition }
        this.selectedId = stop.id
        return this.change({ ...model, stops: [...model.stops, stop] }, originalEvent)
    }

    protected removeStop(id: string, originalEvent?: Event): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const model = this.model()
        if (model.stops.length <= 2 || !model.stops.some(stop => stop.id === id)) return false
        const index = model.stops.findIndex(stop => stop.id === id)
        const stops = model.stops.filter(stop => stop.id !== id)
        this.selectedId = stops[Math.min(index, stops.length - 1)]?.id ?? ''
        return this.change({ ...model, stops }, originalEvent)
    }

    protected moveStop(id: string, position: number, originalEvent?: Event, _commit = false): boolean {
        if (this.unavailable || bool(this.readOnly)) return false
        const model = this.model()
        if (!model.stops.some(stop => stop.id === id)) return false
        const stops = model.stops.map(stop => stop.id === id ? { ...stop, position: Math.round(clamp(position, 0, 100) * 10) / 10 } : stop)
        this.selectedId = id
        return this.change({ ...model, stops }, originalEvent)
    }

    protected changeStopColor(id: string, color: string, originalEvent?: Event, _commit = true): boolean {
        if (this.unavailable || bool(this.readOnly) || !parseHexColor(color)) return false
        const model = this.model()
        if (!model.stops.some(stop => stop.id === id)) return false
        const stops = model.stops.map(stop => stop.id === id ? { ...stop, color: normalizeColor(color) } : stop)
        this.selectedId = id
        return this.change({ ...model, stops }, originalEvent)
    }

    protected changeType(type: GradientType, originalEvent?: Event): boolean { return this.change({ ...this.model(), type }, originalEvent) }
    protected changeAngle(angle: number, originalEvent?: Event, _commit = true): boolean {
        const model = { ...this.model(), angle: finite(angle, this.angle) }
        return this.change(model, originalEvent)
    }
    protected changeShape(shape: GradientShape, originalEvent?: Event): boolean { return this.change({ ...this.model(), shape }, originalEvent) }
    protected changeExtent(extent: GradientExtent, originalEvent?: Event): boolean { return this.change({ ...this.model(), extent }, originalEvent) }
    protected changePosition(position: GradientPosition, originalEvent?: Event): boolean { return this.change({ ...this.model(), position }, originalEvent) }

    protected stopName(index: number, position: number): string {
        return scalarText(this.stopLabel).replaceAll('{index}', String(index + 1)).replaceAll('{position}', `${Math.round(position * 10) / 10}%`)
    }

    private change(model: GradientModel, originalEvent?: Event): boolean { return this.apply(model, originalEvent) }
    private apply(source: GradientModel, originalEvent?: Event): boolean {
        const model = normalizeGradientModel(source)
        const value = serializeGradient(model)
        if (value === this.cssValue()) return false
        const detail:Omit<GradientChangeDetail,'value'|'previousValue'|'originalEvent'>={...model,selectedStopId:this.selectedId}
        return this.commitValue(value,originalEvent,detail,changed=>{
            this.type=model.type
            this.angle=model.angle
            this.shape=model.shape
            this.extent=model.extent
            this.position=model.position
            this.stops=model.stops
            this.value=changed
            this.ensureSelectedStop()
        })
    }

    private adoptValue(): void {
        const parsed = parseGradient(scalarText(this.value))
        if (!parsed) return
        this.type = parsed.type
        this.angle = parsed.angle
        this.shape = parsed.shape
        this.extent = parsed.extent
        this.position = parsed.position
        this.stops = parsed.stops
    }

    private ensureSelectedStop(): void {
        const stops = normalizeGradientStops(this.stops)
        if (!stops.some(stop => stop.id === this.selectedId)) this.selectedId = stops[0]?.id ?? ''
    }

    private nextStopId(): string {
        const ids = new Set(this.model().stops.map(stop => stop.id))
        do { this.stopSequence += 1 } while (ids.has(`stop-${this.stopSequence}`))
        return `stop-${this.stopSequence}`
    }
}
