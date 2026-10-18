import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { componentStory } from './controls.js'
import '../components/editor/index.js'

const meta: Meta = { title: 'Editor', tags: ['autodocs'], parameters: { docs: { description: { component: 'Editor components with headless bases, themed parts, standalone imports and browser bundles.' } } } }
export default meta
type Story = StoryObj
const items = [{ id:'one',label:'Primary item' },{ id:'two',label:'Secondary item' },{ id:'three',label:'Disabled item',disabled:true }]

export const Viewport: Story = componentStory('cb-viewport', {
    label: 'Viewport', accessibleLabel: 'Design workspace', zoom: 100, minZoom: 25, maxZoom: 400, zoomStep: 10,
    x: 0, y: 0, pannable: true, grid: true, controls: true, zoomInLabel: 'Zoom in', zoomOutLabel: 'Zoom out',
    resetLabel: 'Reset view', positionLabel: 'x {x} · y {y}',
})

export const Artboard: Story = componentStory('cb-artboard', {
    label: 'Artboard', accessibleLabel: 'Homepage artboard', width: 640, height: 400, background: '', selected: true,
    selectable: true, showDimensions: true, dimensionsLabel: '{width} × {height}',
})

export const Rulers: Story = componentStory('cb-rulers', {
    label: 'Rulers', accessibleLabel: 'Measured design surface', zoom: 100, originX: 0, originY: 0, majorStep: 100,
    minorDivisions: 10, cursorX: 280, cursorY: 160, showCursor: true, unit: 'px', coordinateLabel: '{x}, {y} {unit}',
})

export const DeviceFrame: Story = componentStory('cb-device-frame', {
    label: 'Device frame', accessibleLabel: 'Responsive preview', device: 'desktop', orientation: 'landscape', width: 1280, height: 720,
    showChrome: true, showOrientationControl: true, orientationLabel: 'Rotate device', screenLabel: 'Application preview',
})

export const Bezier: Story = componentStory('cb-bezier', {
    label: 'Cubic bezier', accessibleLabel: 'Cubic bezier editor', value: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    x1: .25, y1: .1, x2: .25, y2: 1, duration: 1200, playing: false, curveLabel: 'Curve control points',
    previewLabel: 'Motion preview', playLabel: 'Play preview', pauseLabel: 'Pause preview', resetLabel: 'Reset curve',
    x1Label: 'Point 1 X', y1Label: 'Point 1 Y', x2Label: 'Point 2 X', y2Label: 'Point 2 Y',
})

export const Timeline: Story = componentStory('cb-timeline', {
    label: 'Timeline', accessibleLabel: 'Animation timeline', duration: 4, currentTime: 1.2, playing: false, loop: true, snap: .1,
    selectedKeyframeId: 'opacity-2', playLabel: 'Play timeline', pauseLabel: 'Pause timeline', rewindLabel: 'Return to start',
    addKeyframeLabel: 'Add keyframe', playheadLabel: 'Animation playhead', keyframeLabel: '{track} keyframe at {time}',
    timeLabel: '{current} / {duration}', tracks: [
        { id:'opacity', label:'Opacity', keyframes:[{id:'opacity-1',time:0},{id:'opacity-2',time:1.2},{id:'opacity-3',time:4}] },
        { id:'position', label:'Position X', keyframes:[{id:'position-1',time:0},{id:'position-2',time:2.4},{id:'position-3',time:4}] },
        { id:'scale', label:'Scale', keyframes:[{id:'scale-1',time:.6},{id:'scale-2',time:3.1}] },
    ],
})

export const PropertyGroup: Story = componentStory('cb-property-group', {
    label: 'Layout', description: 'Dimensions and visibility for the selected layer.', expanded: true, collapsible: true, dirty: true, mixed: false,
    resetLabel: 'Reset layout', mixedLabel: 'Mixed values', expandLabel: 'Expand layout', collapseLabel: 'Collapse layout',
})

export const SelectionOverlay: Story = componentStory('cb-selection-overlay', {
    label: 'Selected layer', accessibleLabel: 'Selected hero card', rect: { x: 96, y: 72, width: 240, height: 148 }, rotation: 0,
    movable: true, resizable: true, rotatable: true, moveStep: 1, minWidth: 32, minHeight: 24, showSize: true,
    moveLabel: 'Move selected layer', resizeLabel: 'Resize selected layer', rotateLabel: 'Rotate selected layer', sizeLabel: '{width} × {height}',
    handleLabels: { nw: 'Resize from top left', n: 'Resize from top', ne: 'Resize from top right', e: 'Resize from right', se: 'Resize from bottom right', s: 'Resize from bottom', sw: 'Resize from bottom left', w: 'Resize from left' },
})

export const GuideOverlay: Story = componentStory('cb-guide-overlay', {
    zoom: 1,
    guides: [
        { id: 'vertical-center', axis: 'y', position: 380, start: 24, end: 396, label: 'center', type: 'snap' },
        { id: 'top-spacing', axis: 'x', position: 72, start: 48, end: 336, label: '24 px', type: 'measurement' },
        { id: 'insertion', axis: 'x', position: 248, start: 96, end: 520, label: 'Insert here', type: 'insertion' },
    ],
})

export const MarqueeSelection: Story = componentStory('cb-marquee-selection', {
    disabled: false, threshold: 3,
    targets: [
        { id: 'hero', rect: { x: 64, y: 52, width: 180, height: 110 } },
        { id: 'copy', rect: { x: 298, y: 96, width: 220, height: 72 } },
        { id: 'card', rect: { x: 174, y: 238, width: 160, height: 104 } },
    ],
})
