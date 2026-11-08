import { expect, test } from '@playwright/test'
import type { TooltipProvider } from '../../components/overlay/tooltip-provider/index.js'
import type { Button } from '../../components/action/button/index.js'
import type { LayerTree } from '../../components/data-display/layer-tree/index.js'
import type { RichTextEditor } from '../../components/form/rich-text-editor/index.js'
import type { Tooltip } from '../../components/overlay/tooltip/index.js'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-tooltip-provider')))
    await page.evaluate(() => document.addEventListener('error', event => {
        if (event instanceof CustomEvent) {
            const detail = (event as CustomEvent<{ error: Error }>).detail
            if (detail.error) document.body.dataset.componentErrors = [document.body.dataset.componentErrors, String(detail.error)].filter(Boolean).join('\n')
        }
    }, true))
})

test.afterEach(async ({ page }) => {
    expect(await page.locator('body').getAttribute('data-component-errors')).toBeNull()
})

test('opt-in button hints support hover, disabled controls, focus, dismissal and title restoration', async ({ page }) => {
    await page.evaluate(() => {
        const provider = document.createElement('cb-tooltip-provider') as TooltipProvider
        provider.delay = 20
        const button = document.createElement('cb-button') as Button
        Object.assign(button, { label: 'Save document' })
        button.id = 'save'
        button.title = 'Save document'
        const disabled = document.createElement('cb-button') as Button
        Object.assign(disabled, { accessibleLabel: 'Undo change', icon: 'undo', iconOnly: true, disabled: true })
        disabled.id = 'disabled'
        const native = document.createElement('button')
        native.textContent = 'Native button'
        const outside = document.createElement('button')
        outside.textContent = 'Outside scope'
        provider.append(button, disabled, native)
        document.getElementById('fixture')!.append(provider, outside)
    })
    const hint = page.getByRole('tooltip')
    await page.locator('#save').hover()
    await expect(hint).toHaveText('Save document')
    await expect(hint).toBeVisible()
    await expect(page.locator('#save')).toHaveAttribute('title', '')
    await page.locator('#disabled').hover()
    await expect(hint).toHaveText('Undo change')
    await expect(hint).toBeVisible()
    await expect(page.locator('#save')).toHaveAttribute('title', 'Save document')
    await page.getByRole('button', { name: 'Outside scope' }).hover()
    await expect(hint).toBeHidden()
    const native = page.getByRole('button', { name: 'Native button' })
    await native.focus()
    await expect(hint).toBeVisible()
    await expect(hint).toHaveText('Native button')
    await expect(native).toHaveAccessibleDescription('Native button')
    await page.keyboard.press('Escape')
    await expect(hint).toBeHidden()
    await expect(native).toBeFocused()
    await expect(native).not.toHaveAccessibleDescription('Native button')
    await page.getByRole('button', { name: 'Save document' }).focus()
    await expect(hint).toHaveText('Save document')
    await expect(hint).toBeVisible()
    await page.locator('cb-tooltip-provider').evaluate(node => { (node as TooltipProvider).enabled = false })
    await expect(hint).toBeHidden()
    await expect(page.locator('#save')).toHaveAttribute('title', 'Save document')
})

test('explicit shortcut hints override the tooltip but preserve the accessible control name', async ({ page }) => {
    await page.evaluate(() => {
        const provider = document.createElement('cb-tooltip-provider') as TooltipProvider
        provider.delay = 0
        const button = document.createElement('cb-button') as Button
        button.accessibleLabel = 'Style'
        button.title = 'Style (Shift+R)'
        button.dataset.shortcut = 'Shift+R'
        provider.append(button)
        document.getElementById('fixture')!.append(provider)
    })
    const button = page.getByRole('button', { name: 'Style', exact: true })
    await button.hover()
    await expect(page.getByRole('tooltip')).toContainText('Style')
    await expect(page.getByRole('tooltip').locator('cb-shortcut kbd')).toHaveText(['Shift', 'R'])
    await expect(button).toHaveAccessibleName('Style')
    await page.keyboard.press('Escape')
    await expect(page.locator('cb-tooltip-provider > cb-button')).toHaveAttribute('title', 'Style (Shift+R)')
})

test('blur dismisses hovered/focused hints and iframe entry cannot retain a stale hover', async ({ page }) => {
    await page.evaluate(() => {
        const provider = document.createElement('cb-tooltip-provider') as TooltipProvider
        provider.delay = 0
        const button = document.createElement('cb-button') as Button
        Object.assign(button, { label: 'Blur target' })
        const field = document.createElement('input')
        field.setAttribute('aria-label', 'Next focus target')
        const frame = document.createElement('iframe')
        frame.title = 'Other document'
        frame.srcdoc = '<!doctype html><body style="height:100px">Iframe content</body>'
        provider.append(button, field, frame)
        document.getElementById('fixture')!.append(provider)
    })
    const button = page.getByRole('button', { name: 'Blur target', exact: true }), hint = page.getByRole('tooltip')
    await button.hover()
    await button.focus()
    await expect(hint).toBeVisible()
    await button.evaluate(node => (node as HTMLElement).blur())
    await expect(hint).toBeHidden()
    await expect(button).not.toHaveAccessibleDescription('Blur target')
    await page.mouse.move(0, 0)
    await button.focus()
    await expect(hint).toBeVisible()
    await page.getByRole('textbox', { name: 'Next focus target' }).focus()
    await expect(hint).toBeHidden()
    await button.hover()
    await expect(hint).toBeVisible()
    await page.frameLocator('iframe').locator('body').hover()
    await expect(hint).toBeHidden()
})

test('hints escape nested composed scrollports and dismiss when the trigger scrolls out', async ({ page }) => {
    await page.evaluate(() => {
        const provider = document.createElement('cb-tooltip-provider') as TooltipProvider
        provider.delay = 0
        const outer = document.createElement('div')
        outer.id = 'outer-scroll'
        outer.style.cssText = 'position:fixed;left:90px;top:100px;width:320px;height:200px;overflow:auto;border:5px solid;padding:12px'
        const shadowHost = document.createElement('div')
        const shadow = shadowHost.attachShadow({ mode: 'open' })
        const inner = document.createElement('div')
        inner.id = 'inner-scroll'
        inner.style.cssText = 'width:260px;height:180px;overflow:auto;border:3px solid'
        const content = document.createElement('div')
        content.style.cssText = 'position:relative;width:600px;height:700px'
        const button = document.createElement('button')
        button.textContent = 'A tooltip which must remain inside the scrolling panel while content moves'
        button.style.cssText = 'position:absolute;left:4px;top:4px;width:140px;height:30px'
        content.append(button); inner.append(content); shadow.append(inner); outer.append(shadowHost); provider.append(outer)
        document.getElementById('fixture')!.append(provider)
    })
    const button = page.getByRole('button', { name: 'A tooltip which must remain inside the scrolling panel while content moves' })
    const hint = page.getByRole('tooltip'), inner = page.locator('#inner-scroll')
    const assertContained = async (): Promise<void> => {
        await expect.poll(async () => {
            const rect = await hint.boundingBox(), viewport = page.viewportSize()!
            return !!rect && rect.x >= 8 && rect.y >= 8 &&
                rect.x + rect.width <= viewport.width - 8 && rect.y + rect.height <= viewport.height - 8
        }).toBe(true)
    }
    await button.hover()
    await expect(hint).toBeVisible()
    await assertContained()
    await button.focus()
    await page.mouse.move(0, 0)
    // Shadow-root scroll events do not reach the provider's document listener.
    await inner.evaluate(node => { node.scrollTop = 14 })
    await expect(hint).toBeVisible()
    await assertContained()
    await inner.evaluate(node => { node.scrollTop = 300 })
    await expect(hint).toBeHidden()
    await expect(button).not.toHaveAttribute('aria-description')
    await inner.evaluate(node => { node.scrollTop = 0 })
    await button.hover()
    await expect(hint).toBeVisible()
    await assertContained()
})

test('tiny scrolling action bars do not truncate tooltip text', async ({ page }) => {
    await page.evaluate(() => {
        const provider = document.createElement('cb-tooltip-provider') as TooltipProvider
        provider.delay = 0
        const toolbar = document.createElement('div')
        toolbar.style.cssText = 'position:fixed;right:8px;top:8px;width:40px;height:40px;overflow:auto;isolation:isolate;z-index:999999'
        const button = document.createElement('button')
        button.textContent = 'M'
        button.setAttribute('aria-label', 'Show measurements')
        button.style.cssText = 'width:40px;height:40px'
        toolbar.append(button); provider.append(toolbar)
        document.getElementById('fixture')!.append(provider)
    })
    await page.getByRole('button', { name: 'Show measurements' }).hover()
    const hint = page.getByRole('tooltip')
    await expect(hint).toHaveText('Show measurements')
    await expect(hint).toBeVisible()
    expect(await hint.evaluate(node => node.matches(':popover-open'))).toBe(true)
    await expect.poll(() => hint.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
    expect((await hint.boundingBox())!.width).toBeGreaterThan(100)
    await page.mouse.move(0, 300)
    await expect(hint).toBeHidden()
})

test('anchored tooltips accept explicit bounds and hide when their anchor leaves them', async ({ page }) => {
    await page.evaluate(() => {
        const tooltip = document.createElement('cb-tooltip') as Tooltip
        Object.assign(tooltip, { content: 'A bounded tooltip with a long description', open: true,
            anchorRect: { left: 200, top: 85, right: 235, bottom: 105 },
            boundaryRect: { left: 60, top: 80, right: 240, bottom: 200 } })
        document.getElementById('fixture')!.append(tooltip)
    })
    const hint = page.getByRole('tooltip')
    await expect(hint).toBeVisible()
    await expect.poll(async () => {
        const rect = await hint.boundingBox()
        return !!rect && rect.x >= 60 && rect.y >= 80 && rect.x + rect.width <= 240 && rect.y + rect.height <= 200
    }).toBe(true)
    await page.locator('cb-tooltip').evaluate(node => { (node as Tooltip).anchorRect = { left: 250, top: 85, right: 280, bottom: 105 } })
    await expect(hint).toBeHidden()
})

test('hints escape decorative clipping and transforms, flip at viewport edges and track moving anchors', async ({ page }) => {
    await page.evaluate(() => {
        const provider = document.createElement('cb-tooltip-provider') as TooltipProvider
        provider.delay = 0
        const clip = document.createElement('div')
        clip.style.cssText = 'position:fixed;right:2px;top:2px;width:60px;height:40px;overflow:hidden;transform:scale(.8);transform-origin:top right;isolation:isolate'
        const button = document.createElement('cb-button') as Button
        Object.assign(button, { accessibleLabel: 'Zoomed clipped button', label: 'Test' })
        clip.append(button)
        provider.append(clip)
        document.getElementById('fixture')!.append(provider)
    })
    const button = page.getByRole('button', { name: 'Zoomed clipped button' })
    await button.hover()
    const hint = page.getByRole('tooltip')
    await expect(hint).toBeVisible()
    expect(await hint.evaluate(node => node.matches(':popover-open'))).toBe(true)
    const rect = (await hint.boundingBox())!, anchor = (await button.boundingBox())!
    expect(rect.x).toBeGreaterThanOrEqual(8)
    expect(rect.y).toBeGreaterThanOrEqual(anchor.y + anchor.height)
    expect(rect.x + rect.width).toBeLessThanOrEqual(page.viewportSize()!.width - 8)
    await button.focus()
    await page.mouse.move(0, 0)
    await button.evaluate(node => { const host = node.getRootNode(); if (host instanceof ShadowRoot) host.host.parentElement!.style.top = '180px' })
    await expect.poll(async () => (await hint.boundingBox())!.y).toBeGreaterThan(140)
    await button.evaluate(node => { const host = node.getRootNode(); if (host instanceof ShadowRoot) host.host.remove() })
    await expect(hint).toBeHidden()
})

test('composed tree and rich-text buttons receive hints without component-specific wrapping', async ({ page }) => {
    await page.evaluate(() => {
        const provider = document.createElement('cb-tooltip-provider') as TooltipProvider
        provider.delay = 0
        const tree = document.createElement('cb-layer-tree') as LayerTree
        Object.assign(tree, { accessibleLabel: 'Layers', items: [{ id: 'heading', label: 'Heading', actions: [{ id: 'edit', label: 'Edit heading', icon: 'edit' }] }] })
        const rich = document.createElement('cb-rich-text-editor') as RichTextEditor
        Object.assign(rich, { accessibleLabel: 'Text', toolbarLabel: 'Formatting', boldLabel: 'Bold text', value: 'Hello', variant: 'box' })
        provider.append(tree, rich)
        document.getElementById('fixture')!.append(provider)
    })
    const action = page.getByRole('button', { name: 'Edit heading', exact: true })
    await page.locator('cb-layer-tree').getByRole('treeitem').hover()
    await action.hover()
    await expect(page.getByRole('tooltip')).toHaveText('Edit heading')
    await expect(page.getByRole('tooltip')).toBeVisible()
    await page.getByRole('textbox', { name: 'Text', exact: true }).focus()
    await page.getByRole('button', { name: 'Bold text', exact: true }).hover()
    await expect(page.getByRole('tooltip')).toHaveText('Bold text')
    await expect(page.getByRole('tooltip')).toBeVisible()
})

test('nested providers and explicitly wrapped tooltips never create duplicate hints', async ({ page }) => {
    await page.evaluate(() => {
        const outer = document.createElement('cb-tooltip-provider') as TooltipProvider
        const inner = document.createElement('cb-tooltip-provider') as TooltipProvider
        outer.delay = 0; inner.delay = 0
        const button = document.createElement('button')
        button.textContent = 'Nested button'
        inner.append(button)
        const explicit = document.createElement('cb-tooltip')
        explicit.setAttribute('content', 'Explicit hint')
        explicit.setAttribute('delay', '0')
        const trigger = document.createElement('button')
        trigger.textContent = 'Explicit button'
        explicit.append(trigger)
        outer.append(inner, explicit)
        document.getElementById('fixture')!.append(outer)
    })
    await page.getByRole('button', { name: 'Nested button' }).hover()
    await expect(page.getByRole('tooltip').filter({ visible: true })).toHaveCount(1)
    await expect(page.getByRole('tooltip').filter({ visible: true })).toHaveText('Nested button')
    await page.getByRole('button', { name: 'Explicit button' }).hover()
    await expect(page.getByRole('tooltip').filter({ visible: true })).toHaveCount(1)
    await expect(page.getByRole('tooltip').filter({ visible: true })).toHaveText('Explicit hint')
})

test('existing descriptions survive dismissal and a pending hint is cancelled on removal', async ({ page }) => {
    await page.evaluate(() => {
        const provider = document.createElement('cb-tooltip-provider') as TooltipProvider
        provider.delay = 0
        const help = document.createElement('span')
        help.id = 'existing-help'; help.textContent = 'Existing help'
        const button = document.createElement('button')
        button.textContent = 'Commit'
        button.setAttribute('aria-describedby', help.id)
        button.setAttribute('aria-description', 'Authored description')
        provider.append(help, button)
        document.getElementById('fixture')!.append(provider)
    })
    const button = page.getByRole('button', { name: 'Commit', exact: true })
    await button.hover()
    await expect(page.getByRole('tooltip')).toBeVisible()
    await expect(button).toHaveAccessibleDescription('Existing help')
    await page.keyboard.press('Escape')
    await expect(button).toHaveAttribute('aria-describedby', 'existing-help')
    await expect(button).toHaveAttribute('aria-description', 'Authored description')
    await page.locator('cb-tooltip-provider').evaluate(node => { (node as TooltipProvider).delay = 100 })
    await page.mouse.move(0, 0)
    await button.hover()
    await page.locator('cb-tooltip-provider').evaluate(node => node.remove())
    await expect(page.getByRole('tooltip')).toHaveCount(0)
})
