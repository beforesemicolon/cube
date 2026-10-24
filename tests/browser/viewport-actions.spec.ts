import { expect, test } from '@playwright/test'
import type { Viewport, ViewportActionDetail } from '../../components/editor/viewport/index.js'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-viewport')))
    await page.evaluate(() => {
        const viewport = document.createElement('cb-viewport') as Viewport
        Object.assign(viewport, {
            accessibleLabel: 'Canvas', zoomInLabel: 'Zoom in', zoomOutLabel: 'Zoom out', resetLabel: 'Reset',
            positionLabel: 'x {x} · y {y}',
            actions: [
                { id: 'select', icon: 'cursor', label: 'Select', position: 'top-left' },
                { id: 'measurements', icon: 'ruler', label: 'Measurements', position: 'top-right', pressed: true },
                { id: 'fit', icon: 'layers', label: 'Fit', position: 'bottom-right' },
                { id: 'disabled', icon: 'plus', label: 'Unavailable action', position: 'top-left', disabled: true },
            ],
        } satisfies Partial<Viewport>)
        viewport.style.width = '600px'
        viewport.addEventListener('action', event => {
            if (!(event instanceof CustomEvent)) return
            const { action, pressed, originalEvent } = (event as CustomEvent<ViewportActionDetail>).detail
            viewport.dataset.action = action.id
            viewport.dataset.position = action.position
            viewport.dataset.original = String(originalEvent instanceof Event)
            viewport.dataset.count = String(Number(viewport.dataset.count || 0) + 1)
            if (pressed !== undefined) viewport.actions = viewport.actions.map(item => item.id === action.id ? { ...item, pressed } : item)
        })
        document.querySelector('#fixture')!.append(viewport)
    })
})

test('positioned actions augment native controls and remain fixed through zoom, pan and the hand tool', async ({ page }) => {
    const viewport = page.locator('cb-viewport')
    await expect(viewport.locator('[part~=top-left]').getByRole('button', { name: 'Select', exact: true })).toBeVisible()
    await expect(viewport.locator('[part~=top-right]').getByRole('button', { name: 'Measurements', exact: true })).toBeVisible()
    const bottom = viewport.locator('[part~=controls]')
    await expect(bottom.getByRole('button')).toHaveCount(4)
    const fit = (await bottom.getByRole('button', { name: 'Fit', exact: true }).boundingBox())!
    const zoom = (await bottom.getByRole('button', { name: 'Zoom out', exact: true }).boundingBox())!
    expect(fit.x + fit.width).toBeLessThanOrEqual(zoom.x)
    const measure = viewport.getByRole('button', { name: 'Measurements', exact: true })
    const before = await measure.boundingBox()
    await viewport.evaluate(node => { const view = node as Viewport; view.setViewport(40, 100, -70); view.panTool = true })
    expect(await measure.boundingBox()).toEqual(before)
    await measure.click()
    await expect(measure).toHaveAttribute('aria-pressed', 'false')
    await expect(viewport).toHaveAttribute('data-count', '1')
    await expect(viewport).toHaveAttribute('data-position', 'top-right')
    await expect(viewport).toHaveAttribute('data-original', 'true')
    await measure.press('Enter')
    await expect(measure).toHaveAttribute('aria-pressed', 'true')
    await expect(viewport).toHaveAttribute('data-count', '2')
    await expect(viewport).toHaveJSProperty('x', 100)
    await expect(viewport).toHaveJSProperty('y', -70)
    await expect(viewport.locator('[part~=position]')).toHaveText('x 100 · y -70')
    await viewport.evaluate(node => { (node as Viewport).controls = false })
    await expect(bottom.getByRole('button')).toHaveCount(1)
    await bottom.getByRole('button', { name: 'Fit', exact: true }).click()
    await expect(viewport).toHaveAttribute('data-action', 'fit')
    await expect(viewport).toHaveAttribute('data-count', '3')
})

test('disabled actions and vetoes do not dispatch or change controlled state; invalid positions are ignored', async ({ page }) => {
    const viewport = page.locator('cb-viewport'), measure = viewport.getByRole('button', { name: 'Measurements', exact: true })
    await expect(viewport.getByRole('button', { name: 'Unavailable action', exact: true })).toBeDisabled()
    await viewport.evaluate(node => node.addEventListener('beforeaction', event => event.preventDefault(), { once: true }))
    await measure.click()
    await expect(measure).toHaveAttribute('aria-pressed', 'true')
    await expect(viewport).not.toHaveAttribute('data-count')
    await viewport.evaluate(node => {
        node.setAttribute('actions', JSON.stringify([{ id: 'invalid', label: 'Invalid', icon: 'plus', position: 'bottom-left' }]))
    })
    await expect(viewport.locator('[part~=action]')).toHaveCount(0)
    await expect(viewport.getByRole('button', { name: 'Zoom in', exact: true })).toBeVisible()
})
