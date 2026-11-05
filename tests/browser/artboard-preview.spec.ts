import { expect, test } from '@playwright/test'
import type { Artboard, ArtboardPreviewDetail } from '../../components/editor/artboard/index.js'
import type { SelectionOverlay } from '../../components/editor/selection-overlay/index.js'
import type { Viewport } from '../../components/editor/viewport/index.js'

test('scrolling artboard preset popups never pans or zooms their viewport, including at list edges', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => !!customElements.get('cb-artboard'))
    await page.evaluate(() => {
        const viewport = document.createElement('cb-viewport') as Viewport
        Object.assign(viewport, { zoom: 80, x: 10, y: -20, controls: false })
        viewport.style.cssText = 'width:1000px;--component-viewport-height:600px'
        const board = document.createElement('cb-artboard') as Artboard
        Object.assign(board, { width: 600, height: 400, showPreviewControls: true,
            previewLabels: { controls: 'Preview', presets: 'Sizes', default: 'Artboard', size: 'Device', mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' },
            previewPresets: Array.from({ length: 24 }, (_, i) => ({ id: `preset-${i}`, category: 'desktop', label: `Device ${i}`, width: 1200 + i, height: 900 })),
        } satisfies Partial<Artboard>)
        viewport.append(board); document.querySelector('#fixture')?.append(viewport)
    })
    const viewport = page.locator('cb-viewport'), board = viewport.locator('cb-artboard')
    await board.locator('cb-select').getByRole('button').click()
    const list = board.getByRole('listbox', { name: 'Sizes', exact: true })
    const before = { zoom: 80, x: 10, y: -20 }
    for (const panTool of [false, true]) {
        await viewport.evaluate((node, panTool) => { (node as Viewport).panTool = panTool }, panTool)
        await list.evaluate(node => { node.scrollTop = 0 })
        await list.hover(); await page.mouse.wheel(0, 500)
        await expect.poll(() => list.evaluate(node => node.scrollTop)).toBeGreaterThan(0)
        await list.evaluate(node => { node.scrollTop = node.scrollHeight })
        await page.mouse.wheel(30, 500)
        await list.evaluate(node => { node.scrollTop = 0 })
        await page.mouse.wheel(-30, -500)
        for (const key of ['ctrlKey', 'metaKey']) await list.dispatchEvent('wheel', { deltaY: -50, [key]: true })
        await expect(viewport).toHaveJSProperty('x', before.x)
        await expect(viewport).toHaveJSProperty('y', before.y)
        await expect(viewport).toHaveJSProperty('zoom', before.zoom)
    }
    await page.keyboard.press('Escape')
    await viewport.locator('[part~=viewport]').hover({ position: { x: 10, y: 10 } })
    await page.mouse.wheel(12, 25)
    await expect(viewport).toHaveJSProperty('x', -2)
    await expect(viewport).toHaveJSProperty('y', -45)
})

test('preview controls and selection actions remain separately clickable near the top edge', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => !!customElements.get('cb-selection-overlay'))
    await page.evaluate(() => {
        const board = document.createElement('cb-artboard') as Artboard
        Object.assign(board, { width: 500, height: 300, showPreviewControls: true, previewLabels: { controls: 'Preview tools', mode: 'Mode', size: 'Size' } } satisfies Partial<Artboard>)
        const overlay = document.createElement('cb-selection-overlay') as SelectionOverlay
        Object.assign(overlay, { rect: { x: 0, y: 0, width: 500, height: 40 }, movable: false, resizable: false, showSize: false,
            actionsLabel: 'Selection tools', actions: [{ id: 'edit', label: 'Edit selected' }] } satisfies Partial<SelectionOverlay>)
        overlay.addEventListener('action', () => { board.dataset.edited = 'true' })
        board.append(overlay)
        document.querySelector('#fixture')?.append(board)
    })
    const preview = page.getByRole('group', { name: 'Preview tools', exact: true }), actions = page.getByRole('toolbar', { name: 'Selection tools', exact: true })
    await expect(preview).toBeVisible(); await expect(actions).toBeVisible()
    await expect.poll(async () => {
        const p = await preview.boundingBox(), a = await actions.boundingBox()
        return !!p && !!a && (a.y >= p.y + p.height || a.y + a.height <= p.y || a.x >= p.x + p.width || a.x + a.width <= p.x)
    }).toBe(true)
    await page.getByRole('button', { name: 'Edit selected', exact: true }).click()
    await expect(page.locator('cb-artboard')).toHaveAttribute('data-edited', 'true')
})

test('icon presets lock device sizes, Artboard restores free sizing, and preview changes honor vetoes', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => !!customElements.get('cb-artboard'))
    await page.evaluate(() => {
        const board = document.createElement('cb-artboard') as Artboard
        Object.assign(board, { width: 840, height: 560, viewportSizing: true, showPreviewControls: true,
            previewPresets: [{ id: 'mobile', category: 'mobile', label: 'Mobile', width: 390, height: 844 },
                { id: 'tablet', category: 'tablet', label: 'Tablet', width: 768, height: 1024 }, { id: 'desktop', category: 'desktop', label: 'Desktop', width: 1440, height: 900 }],
            previewLabels: { controls: 'Preview', size: 'Device', default: 'Artboard', mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop', presets: 'Sizes' },
            resizeLabel: '{handle}', handleLabels: { e: 'Resize right', s: 'Resize bottom', se: 'Resize corner' },
        } satisfies Partial<Artboard>)
        board.style.marginTop = '180px'
        board.addEventListener('previewchange', event => {
            const detail = (event as CustomEvent<ArtboardPreviewDetail>).detail
            board.dataset.mode = detail.value.mode
        })
        document.querySelector('#fixture')?.append(board)
    })
    const board = page.locator('cb-artboard')
    await board.getByRole('radio', { name: 'Mobile', exact: true }).click()
    await expect(board).toHaveJSProperty('width', 390)
    await expect(board).toHaveJSProperty('selected', false)
    await expect(board).toHaveJSProperty('previewMode', 'device')
    await expect(board).toHaveJSProperty('height', 844)
    await expect(board.locator('[part="content-viewport"]')).toHaveCSS('overflow', 'auto')
    await expect(board.getByRole('radio')).toHaveCount(3)
    await expect(board.getByRole('spinbutton')).toHaveCount(0)
    expect(await board.evaluate(node => (node as Artboard).resize(450, 600))).toBe(false)
    await board.evaluate(node => { (node as Artboard).selected = true })
    await expect(board.getByRole('button', { name: 'Resize right', exact: true })).toHaveCount(0)
    await board.getByRole('radio', { name: 'Tablet', exact: true }).click()
    await expect(board).toHaveJSProperty('width', 768)
    await expect(board).toHaveJSProperty('height', 1024)
    await board.locator('cb-select').getByRole('button').click()
    await expect(page.getByRole('option', { name: 'Custom', exact: true })).toHaveCount(0)
    await page.getByRole('option', { name: 'Artboard', exact: true }).click()
    await expect(board).toHaveJSProperty('width', 840)
    await expect(board).toHaveJSProperty('height', 560)
    await expect(board).toHaveJSProperty('previewMode', 'width')
    await board.getByRole('button', { name: 'Resize right', exact: true }).press('ArrowRight')
    await expect(board).toHaveJSProperty('width', 841)
    await board.getByRole('radio', { name: 'Desktop', exact: true }).click()
    await expect(board).toHaveJSProperty('height', 900)
    await board.locator('cb-select').getByRole('button').click()
    await page.getByRole('option', { name: 'Artboard', exact: true }).click()
    await expect(board).toHaveJSProperty('width', 841)
    expect(await board.evaluate(node => {
        const artboard = node as Artboard
        artboard.addEventListener('beforepreviewchange', event => event.preventDefault(), { once: true })
        return artboard.setPreview({ mode: 'width', presetId: 'default', width: 800, height: 600, linked: false })
    })).toBe(false)
    await expect(board).toHaveJSProperty('width', 841)
    await board.evaluate(node => { (node as Artboard).disabled = true })
    expect(await board.evaluate(node => (node as Artboard).setPreview({ mode: 'width', presetId: 'default', width: 800, height: 600, linked: false }))).toBe(false)
})
