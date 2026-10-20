import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

interface ViewportElement extends HTMLElement { zoom:number; x:number; y:number }
interface ArtboardElement extends HTMLElement { selected:boolean }
interface RulersElement extends HTMLElement { cursorX:number; cursorY:number }
interface DeviceFrameElement extends HTMLElement { device:string; orientation:string }
interface BezierElement extends HTMLElement { value:string; playing:boolean }
interface TimelineElement extends HTMLElement { currentTime:number; playing:boolean; tracks:readonly TimelineTrack[] }
interface TimelineTrack { readonly id:string; readonly label:string; readonly keyframes:readonly { readonly id:string; readonly time:number }[] }

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-timeline')))
})

test('viewport pans and zooms while artboard remains a distinct selectable document', async ({ page }) => {
    await page.evaluate(() => {
        const viewport = document.createElement('cb-viewport') as ViewportElement & Record<string,string|number|boolean>
        Object.assign(viewport, { accessibleLabel:'Design workspace', zoom:100, x:0, y:0, zoomInLabel:'Zoom in', zoomOutLabel:'Zoom out', resetLabel:'Reset view', positionLabel:'x {x} y {y}' })
        const artboard = document.createElement('cb-artboard') as ArtboardElement & Record<string,string|number|boolean>
        Object.assign(artboard, { accessibleLabel:'Homepage artboard', width:640, height:400, selected:false, selectable:true, showDimensions:true, dimensionsLabel:'{width} × {height}' })
        viewport.append(artboard)
        document.querySelector('#fixture')?.append(viewport)
    })
    const viewport = page.locator('cb-viewport')
    await viewport.getByRole('button', { name:'Zoom in' }).click()
    await expect(viewport).toHaveJSProperty('zoom', 110)
    const workspace = viewport.getByRole('region', { name:'Design workspace' })
    await workspace.focus(); await workspace.press('ArrowRight')
    await expect(viewport).toHaveJSProperty('x', 5)
    const artboard = viewport.locator('cb-artboard')
    await expect(artboard.locator('[part~="dimensions"]')).toHaveText('640 × 400')
    await artboard.getByRole('region', { name:'Homepage artboard' }).click()
    await expect(artboard).toHaveJSProperty('selected', true)
})

test('rulers measure pointer coordinates and device frame changes real chrome and orientation', async ({ page }) => {
    await page.evaluate(() => {
        const rulers = document.createElement('cb-rulers') as RulersElement & Record<string,string|number|boolean>
        Object.assign(rulers, { accessibleLabel:'Measured surface', zoom:100, cursorX:20, cursorY:30, showCursor:true, unit:'px', coordinateLabel:'{x}, {y} {unit}' })
        const frame = document.createElement('cb-device-frame') as DeviceFrameElement & Record<string,string|number|boolean>
        Object.assign(frame, { accessibleLabel:'Device preview', screenLabel:'Application screen', device:'mobile', orientation:'portrait', orientationLabel:'Rotate device' })
        document.querySelector('#fixture')?.append(rulers, frame)
    })
    const rulers = page.locator('cb-rulers')
    const surface = rulers.getByRole('region', { name:'Measured surface' })
    await surface.hover({ position:{ x:180, y:120 } })
    await expect.poll(() => rulers.evaluate(node => (node as RulersElement).cursorX)).toBeGreaterThan(100)
    await expect(rulers.locator('[part~="cursor"]')).toContainText('px')
    const frame = page.locator('cb-device-frame')
    await expect(frame.locator('[part~="device"]')).toHaveAttribute('data-device', 'mobile')
    await expect(frame.locator('[part~="notch"]')).toBeVisible()
    await frame.getByRole('button', { name:'Rotate device' }).click()
    await expect(frame).toHaveJSProperty('orientation', 'landscape')
})

test('bezier edits control points and timeline supports selection, keyframe movement, and playback', async ({ page }) => {
    await page.evaluate(() => {
        const bezier = document.createElement('cb-bezier') as BezierElement & Record<string,string|number|boolean>
        Object.assign(bezier, { label:'Cubic bezier', accessibleLabel:'Bezier editor', value:'cubic-bezier(0.25, 0.1, 0.25, 1)', curveLabel:'Curve control points', previewLabel:'Motion preview', playLabel:'Play preview', pauseLabel:'Pause preview', resetLabel:'Reset curve', x1Label:'Point 1 X', y1Label:'Point 1 Y', x2Label:'Point 2 X', y2Label:'Point 2 Y' })
        const timeline = document.createElement('cb-timeline') as TimelineElement & Record<string,string|number|boolean|readonly TimelineTrack[]>
        Object.assign(timeline, { accessibleLabel:'Animation timeline', duration:4, currentTime:1, snap:.1, playLabel:'Play timeline', pauseLabel:'Pause timeline', rewindLabel:'Return to start', addKeyframeLabel:'Add keyframe', playheadLabel:'Animation playhead', keyframeLabel:'{track} keyframe at {time}', timeLabel:'{current} / {duration}', tracks:[{id:'opacity',label:'Opacity',keyframes:[{id:'start',time:0},{id:'middle',time:1},{id:'end',time:4}]}] })
        document.querySelector('#fixture')?.append(bezier, timeline)
    })
    const bezier = page.locator('cb-bezier')
    const firstHandle = bezier.getByRole('slider', { name:'Point 1 X, Point 1 Y' })
    await firstHandle.focus(); await firstHandle.press('ArrowRight')
    await expect.poll(() => bezier.evaluate(node => (node as BezierElement).value)).toContain('0.26')
    await bezier.getByRole('button', { name:'Play preview' }).click()
    await expect(bezier.locator('[part~="preview"]')).toHaveAttribute('data-playing', '')

    const timeline = page.locator('cb-timeline')
    const keyframe = timeline.getByRole('button', { name:'Opacity keyframe at 1s' })
    await keyframe.click(); await expect(keyframe).toHaveAttribute('aria-pressed', 'true')
    await keyframe.press('ArrowRight')
    await expect.poll(() => timeline.evaluate(node => (node as TimelineElement).currentTime)).toBe(1.1)
    await timeline.getByRole('button', { name:'Play timeline' }).click()
    await expect(timeline.getByRole('button', { name:'Pause timeline' })).toBeVisible()

    const accessibility = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(accessibility.violations).toEqual([])
})
