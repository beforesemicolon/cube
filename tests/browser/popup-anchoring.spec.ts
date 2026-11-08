import { expect, test, type Locator } from '@playwright/test'
import type { Select } from '../../components/form/select/index.js'
import type { Combobox } from '../../components/form/combobox/index.js'
import type { Dropdown } from '../../components/overlay/dropdown/index.js'
import type { UnitInput } from '../../components/form/unit-input/index.js'
import type { ContextMenu } from '../../components/overlay/context-menu/index.js'

test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1100 })
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-color-picker')))
})

const cases = [
    { tag: 'cb-select', anchor: '[part~=trigger]', popup: '[part~=popup]' },
    { tag: 'cb-combobox', anchor: '[part~=input-shell]', popup: '[part~=popup]' },
    { tag: 'cb-date-picker', anchor: '[part~=trigger]', popup: '[part~=popup]' },
    { tag: 'cb-time-picker', anchor: '[part~=trigger]', popup: '[part~=popup]' },
    { tag: 'cb-color-picker', anchor: '[part~=trigger]', popup: '[part~=popup]' },
    { tag: 'cb-dropdown', anchor: '[part~=trigger]', popup: '[part~=popup]' },
    { tag: 'cb-split-button', anchor: '[part~=trigger]', popup: '[part~=popup]' },
    { tag: 'cb-popover', anchor: '[part~=anchor]', popup: '[part~=panel]' },
    { tag: 'cb-hover-card', anchor: '[part~=anchor]', popup: '[part~=panel]' },
    { tag: 'cb-unit-input', anchor: 'cb-select [part~=trigger]', popup: 'cb-select [part~=popup]' },
    { tag: 'cb-rich-text-editor', anchor: '[contenteditable]', popup: 'cb-rich-text-toolbar' },
] as const

async function expectAttached(anchor: Locator, popup: Locator, above = false): Promise<void> {
    await expect(popup).toBeVisible()
    await expect.poll(async () => {
        const a = await anchor.boundingBox(), p = await popup.boundingBox()
        if (!a || !p) return Infinity
        return Math.max(Math.abs(p.x - a.x), Math.abs(above ? p.y + p.height + 6 - a.y : p.y - a.y - a.height - 6))
    }).toBeLessThan(1)
}

for (const entry of cases) test(`${entry.tag} popup follows transforms and layout shifts without scroll/resize`, async ({ page }) => {
    await page.evaluate(tag => {
        const moving = document.createElement('div')
        moving.id = 'moving'
        moving.style.cssText = 'position:absolute;left:250px;top:300px;width:350px;transform-origin:0 0'
        const host = document.createElement(tag)
        host.id = 'subject'
        host.setAttribute('accessible-label', 'Anchored control')
        host.setAttribute('label', 'Choose')
        host.setAttribute('placeholder', 'Choose')
        host.setAttribute('popup-max-height', '140px')
        host.style.width = '300px'
        if (tag === 'cb-select' || tag === 'cb-combobox') (host as Select | Combobox).options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]
        if (tag === 'cb-dropdown' || tag === 'cb-split-button') (host as Dropdown).items = [{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]
        if (tag === 'cb-unit-input') Object.assign(host as UnitInput, { value: 12, unit: 'px', units: ['px', 'rem'] })
        if (tag === 'cb-popover' || tag === 'cb-hover-card') host.innerHTML = '<button slot="trigger">Show details</button><p>Anchored content</p>'
        moving.append(host)
        document.getElementById('fixture')!.append(moving)
    }, entry.tag)
    const host = page.locator('#subject'), anchor = host.locator(entry.anchor), popup = host.locator(entry.popup)
    await expect(anchor).toBeVisible()
    if (entry.tag === 'cb-rich-text-editor') await anchor.focus()
    else if (entry.tag === 'cb-unit-input') await host.locator('cb-select').evaluate(node => node.setAttribute('open', ''))
    else await host.evaluate(node => node.setAttribute('open', ''))
    await expectAttached(anchor, popup, entry.tag === 'cb-rich-text-editor')

    for (const transform of ['translate(97px, 53px)', 'translate(170px, 90px) scale(.8)', 'translate(-40px, -30px) scale(1.15)']) {
        await page.locator('#moving').evaluate((node, value) => { (node as HTMLElement).style.transform = value }, transform)
        await expectAttached(anchor, popup, entry.tag === 'cb-rich-text-editor')
    }
    // No scrolling, resizing or transform mutation: ordinary document layout
    // changes also need to move the top-layer popup.
    await host.evaluate(node => { (node as HTMLElement).style.marginTop = '45px' })
    await expectAttached(anchor, popup, entry.tag === 'cb-rich-text-editor')
    await page.keyboard.press('Escape')
    await expect(popup).toBeHidden()
})

test('select follows real viewport wheel pan and cursor-centered zoom, preserving search and selection', async ({ page }) => {
    await page.evaluate(() => {
        const viewport = document.createElement('cb-viewport')
        viewport.setAttribute('accessible-label', 'Canvas')
        viewport.style.cssText = 'display:block;width:1000px;height:700px'
        const select = document.createElement('cb-select') as Select
        select.id = 'canvas-select'
        select.accessibleLabel = 'Device'
        select.searchable = true
        select.options = [{ value: 'mobile', label: 'Mobile' }, { value: 'desktop', label: 'Desktop' }]
        select.style.cssText = 'display:block;width:240px'
        viewport.append(select)
        document.getElementById('fixture')!.append(viewport)
    })
    const host = page.locator('#canvas-select'), anchor = host.locator('[part~=trigger]'), popup = host.locator('[part~=popup]')
    await anchor.click()
    const search = host.getByRole('combobox')
    await search.fill('desk')
    await expectAttached(anchor, popup)
    const beforePan = await anchor.boundingBox()
    const canvas = await page.locator('cb-viewport').boundingBox()
    expect(canvas).not.toBeNull()
    await page.mouse.move(canvas!.x + canvas!.width - 80, canvas!.y + 280)
    await page.mouse.wheel(-80, -45)
    await expect.poll(async () => (await anchor.boundingBox())!.x).toBeGreaterThan(beforePan!.x + 50)
    await expectAttached(anchor, popup)
    await expect(search).toBeFocused()
    await expect(search).toHaveValue('desk')
    await page.keyboard.down('Control')
    await page.mouse.wheel(0, -100)
    await page.keyboard.up('Control')
    await expect.poll(async () => (await anchor.boundingBox())!.width).toBeGreaterThan(beforePan!.width)
    await expectAttached(anchor, popup)
    await host.getByRole('option', { name: 'Desktop', exact: true }).click()
    await expect(host).toHaveJSProperty('value', 'desktop')
    await expect(popup).toBeHidden()
})

test('point-anchored context menus stay at their clicked coordinates when their host moves', async ({ page }) => {
    await page.evaluate(() => {
        const host = document.createElement('cb-context-menu') as ContextMenu
        host.items = [{ id: 'a', label: 'Alpha' }]
        document.getElementById('fixture')!.append(host)
    })
    const host = page.locator('cb-context-menu')
    await host.evaluate(node => (node as ContextMenu).showAt(360, 300))
    const menu = host.getByRole('menu')
    await expect(menu).toBeVisible()
    const before = await menu.boundingBox()
    await host.evaluate(node => { (node as HTMLElement).style.transform = 'translate(100px, 80px)' })
    await page.evaluate(async () => {
        for (let i = 0; i < 3; i++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
    await expect.poll(() => menu.boundingBox()).toEqual(before)
})

test('tracking follows every animation frame and retains end alignment, flip and viewport clamping', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const path = '/components/core/popup.ts'
        const { PopupController } = await import(path) as typeof import('../../components/core/popup.js')
        const anchor = document.createElement('button'), popup = document.createElement('div')
        anchor.style.cssText = 'position:absolute;left:300px;top:300px;width:200px;height:30px'
        popup.style.cssText = 'width:180px;height:80px'
        document.body.append(anchor, popup)
        const controller = new PopupController(popup, anchor, () => controller.hide(), { placement: () => 'bottom-end' })
        const settle = async (): Promise<void> => {
            for (let i = 0; i < 3; i++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        }
        try {
            controller.show()
            await settle()
            const animation = anchor.animate([{ transform: 'translate(0, 0)' }, { transform: 'translate(120px, 60px)' }], { duration: 250, fill: 'forwards' })
            let maximumError = 0, samples = 0
            while (animation.playState !== 'finished') {
                await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
                const a = anchor.getBoundingClientRect(), p = popup.getBoundingClientRect()
                maximumError = Math.max(maximumError, Math.abs(p.right - a.right), Math.abs(p.top - a.bottom - 6))
                samples++
            }
            animation.cancel()
            anchor.style.cssText = `position:absolute;left:${innerWidth - 20}px;top:${innerHeight - 50}px;width:200px;height:30px`
            await settle()
            const a = anchor.getBoundingClientRect(), p = popup.getBoundingClientRect()
            return { maximumError, samples, flipped: Math.abs(p.bottom + 6 - a.top) < 1, clamped: Math.abs(p.right - innerWidth + 8) < 1 }
        } finally {
            controller.dispose(); anchor.remove(); popup.remove()
        }
    })
    expect(result.samples).toBeGreaterThan(2)
    expect(result.maximumError).toBeLessThan(1)
    expect(result.flipped).toBe(true)
    expect(result.clamped).toBe(true)
})

test('shared tracking stays idle when stationary and cleans up on hide, dispose and removal', async ({ page }) => {
    const result = await page.evaluate(async () => {
        const path = '/components/core/popup.ts'
        const { PopupController } = await import(path) as typeof import('../../components/core/popup.js')
        const anchor = document.createElement('button'), popup = document.createElement('div')
        anchor.style.cssText = 'position:absolute;left:200px;top:250px;width:120px;height:30px'
        popup.style.cssText = 'width:160px;height:80px'
        document.body.append(anchor, popup)
        const originalRequest = window.requestAnimationFrame.bind(window), originalCancel = window.cancelAnimationFrame.bind(window)
        const pending = new Set<number>()
        window.requestAnimationFrame = callback => {
            const id = originalRequest(time => { pending.delete(id); callback(time) })
            pending.add(id)
            return id
        }
        window.cancelAnimationFrame = id => { pending.delete(id); originalCancel(id) }
        const settle = async (): Promise<void> => {
            for (let i = 0; i < 4; i++) await new Promise<void>(resolve => originalRequest(() => resolve()))
        }
        const controller = new PopupController(popup, anchor, () => controller.hide())
        try {
            controller.show()
            await settle()
            let writes = 0
            const observer = new MutationObserver(records => { writes += records.length })
            observer.observe(popup, { attributes: true, attributeFilter: ['style'] })
            await settle()
            observer.disconnect()
            const active = pending.size
            controller.hide()
            await settle()
            const hidden = pending.size
            controller.show()
            await settle()
            controller.dispose()
            await settle()
            const disposed = pending.size
            controller.show()
            anchor.remove()
            await settle()
            return { writes, active, hidden, disposed, removed: pending.size, popupHidden: popup.hidden }
        } finally {
            controller.dispose()
            window.requestAnimationFrame = originalRequest
            window.cancelAnimationFrame = originalCancel
            anchor.remove(); popup.remove()
        }
    })
    expect(result).toEqual({ writes: 0, active: 1, hidden: 0, disposed: 0, removed: 0, popupHidden: true })
})
