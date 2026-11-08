import { expect, test } from '@playwright/test'
import type { Artboard } from '../../components/editor/artboard/index.js'
import type { Button } from '../../components/action/button/index.js'

test('packaged controls reuse immutable stylesheets and lazy artboard chrome reconnects safely', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => !!customElements.get('cb-artboard'))
    await page.locator('#fixture').evaluate(container => {
        const board = document.createElement('cb-artboard') as Artboard
        Object.assign(board, { width: 420, height: 240, name: 'Preview', resizable: false, showPreviewControls: false,
            previewLabels: { controls: 'Page preview', presets: 'Preview size', default: 'Artboard', size: 'Preview device', mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' },
            previewPresets: [{ id: 'phone', label: 'Phone', category: 'mobile', width: 390, height: 844 }] } satisfies Partial<Artboard>)
        container.append(board)
        for (let index = 0; index < 3; index++) {
            const button = document.createElement('cb-button') as Button
            button.label = `Shared ${index}`; container.append(button)
        }
    })
    await expect.poll(() => page.locator('#fixture > cb-button').evaluateAll(nodes => {
        const sheets = nodes.map(node => (node as Button).contentRoot).map(root => root instanceof ShadowRoot ? root.adoptedStyleSheets[0] : null)
        return sheets.length === 3 && sheets.every(sheet => !!sheet && sheet === sheets[0])
    })).toBe(true)
    const board = page.locator('cb-artboard')
    await expect(board.locator('[part=preview-controls]')).toHaveCount(0)
    await expect(board.locator('[part~=resize-handle]')).toHaveCount(0)
    for (const enabled of [true, false, true]) {
        await board.evaluate((node, enabled) => { (node as Artboard).showPreviewControls = enabled }, enabled)
        await expect(board.locator('[part=preview-controls]')).toHaveCount(enabled ? 1 : 0)
    }
    await board.locator('cb-select').getByRole('button').click()
    await page.getByRole('option', { name: 'Phone · 390 × 844', exact: true }).click()
    await expect(board).toHaveJSProperty('width', 390)
    await expect(board).toHaveJSProperty('height', 844)
})
