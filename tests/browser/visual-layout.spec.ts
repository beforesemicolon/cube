import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-color-picker')))
})

test('composed menu buttons retain padding, alignment, and row height', async ({ page }) => {
    await page.evaluate(() => {
        for (const tag of ['cb-menu']) {
            const control = document.createElement(tag)
            Object.assign(control, { label: 'Items', items: [{ id: 'one', label: 'First' }, { id: 'two', label: 'Second', href: '#second' }], value: 'one' })
            document.querySelector('#fixture')?.append(control)
        }
    })
    for (const tag of ['cb-menu']) {
        const item = page.locator(`${tag} cb-button`).first()
        await expect(item).toBeVisible()
        const layout = await item.evaluate(host => {
            const control = host.shadowRoot?.querySelector<HTMLElement>('[part~="control"]')
            if (!control) throw new Error('Missing button control')
            const style = getComputedStyle(control)
            return { padding: parseFloat(style.paddingInlineStart), display: style.display, height: host.getBoundingClientRect().height }
        })
        expect(layout.padding).toBeGreaterThanOrEqual(8)
        expect(layout.display).toBe('grid')
        expect(layout.height).toBeGreaterThanOrEqual(28)
    }
    await expect(page.locator('cb-menu cb-link [part~=label]')).toHaveCSS('display', 'contents')
})

test('tokens are compact bordered pills, not full-width list rows', async ({ page }) => {
    await page.evaluate(() => {
        const control = document.createElement('cb-token-input')
        Object.assign(control, { items: [{ id: 'one', label: 'Alpha' }, { id: 'two', label: 'Beta' }], value: ['one'] })
        document.querySelector('#fixture')?.append(control)
    })
    const tokens = page.locator('cb-token-input cb-button')
    await expect(tokens).toHaveCount(2)
    const rects = await tokens.evaluateAll(nodes => nodes.map(node => {
        const box = node.getBoundingClientRect()
        const control = node.shadowRoot?.querySelector('[part~="control"]')
        return { y: box.y, width: box.width, border: control ? getComputedStyle(control).borderTopStyle : '' }
    }))
    expect(rects[0]!.y).toBe(rects[1]!.y)
    for (const rect of rects) { expect(rect.width).toBeLessThan(120); expect(rect.border).toBe('solid') }
})

test('picker triggers keep their text and icon on one padded row', async ({ page }) => {
    await page.evaluate(() => {
        for (const tag of ['cb-select', 'cb-date-picker', 'cb-time-picker']) {
            const control = document.createElement(tag)
            Object.assign(control, { label: 'Value', value: tag === 'cb-select' ? 'one' : tag === 'cb-date-picker' ? '2026-10-18' : '09:30', options: [{ value: 'one', label: 'First' }] })
            document.querySelector('#fixture')?.append(control)
        }
    })
    for (const tag of ['cb-select', 'cb-date-picker', 'cb-time-picker']) {
        const trigger = page.locator(`${tag} cb-button[part~=trigger]`).first()
        await expect(trigger).toBeVisible()
        const layout = await trigger.evaluate(host => {
            const control = host.shadowRoot?.querySelector('[part~="control"]')
            if (!control) throw new Error('Missing trigger surface')
            const style = getComputedStyle(control)
            return { padding: parseFloat(style.paddingInlineStart), height: host.getBoundingClientRect().height }
        })
        expect(layout.padding).toBe(12)
        expect(layout.height).toBe(28)
    }
})

test('color swatches fill their trigger and expandable headings stay left-aligned', async ({ page }) => {
    await page.evaluate(() => {
        const color = document.createElement('cb-color-picker')
        Object.assign(color, { value: '#2563eb', label: 'Fill' })
        const section = document.createElement('cb-expandable-section')
        Object.assign(section, { label: 'Details', expanded: true })
        section.textContent = 'Section content'
        document.querySelector('#fixture')?.append(color, section)
    })
    const swatch = page.locator('cb-color-picker [part~=trigger-swatch]')
    await expect(swatch).toBeVisible()
    const bounds = await swatch.boundingBox()
    expect(bounds?.width).toBeGreaterThanOrEqual(26)
    expect(bounds?.height).toBeGreaterThanOrEqual(26)
    const section = page.locator('cb-expandable-section')
    const heading = section.locator('[part~=label]').first()
    const left = (await heading.boundingBox())!.x - (await section.boundingBox())!.x
    expect(left).toBeGreaterThanOrEqual(20)
    expect(left).toBeLessThan(40)
})

test('card is only a styled surface and preserves consumer-owned content and layout', async ({ page }) => {
    await page.evaluate(() => {
        const card = document.createElement('cb-card')
        const content = document.createElement('p'); content.textContent = 'Custom card content'
        card.append(content)
        document.querySelector('#fixture')?.append(card)
    })
    const card = page.locator('cb-card')
    await expect(card.locator('[part~=generated-content], [part~=panel-header], [part~=card-media], cb-button')).toHaveCount(0)
    await expect(card).toHaveCSS('display','block')
    await expect(card).toHaveCSS('border-top-width','1px')
    await expect(card).toHaveCSS('padding-top','16px')
    expect(await card.evaluate(node => [...(node.shadowRoot?.children ?? [])].filter(child => child.localName !== 'style').map(child => child.localName))).toEqual(['slot'])
    await expect(page.getByText('Custom card content')).toBeVisible()
    await card.evaluate(node => Object.assign(node, { padding: '24px', radius: '20px', width: '280px', border: '2px solid red', background: 'rgb(10, 20, 30)', shadow: 'none' }))
    await expect(card).toHaveCSS('padding-top','24px')
    await expect(card).toHaveCSS('border-radius','20px')
    await expect(card).toHaveCSS('width','280px')
    await expect(card).toHaveCSS('border-top-width','2px')
    await expect(card).toHaveCSS('background-color','rgb(10, 20, 30)')
    await expect(card).toHaveCSS('box-shadow','none')
    expect(await card.evaluate(node => ['value','items','actionLabel'].filter(prop => prop in node))).toEqual([])
})

test('sidebar responds to programmatic collapse without stale reflected attributes', async ({ page }) => {
    await page.evaluate(() => {
        const sidebar = document.createElement('cb-sidebar')
        Object.assign(sidebar, { label: 'Layers', collapsible: true, expanded: true, expandLabel: 'Expand layers', collapseLabel: 'Collapse layers' })
        const content = document.createElement('span'); content.textContent = 'Navigation content'
        sidebar.append(content)
        document.querySelector('#fixture')?.append(sidebar)
    })
    const sidebar = page.locator('cb-sidebar')
    await expect(sidebar).toHaveCSS('width', '280px')
    await sidebar.evaluate((node: HTMLElement & { expanded: boolean }) => { node.expanded = false })
    await expect(sidebar).toHaveCSS('width', '48px')
    await expect(sidebar.getByRole('button', { name: 'Expand layers' })).toBeVisible()
    await expect(sidebar.getByText('Navigation content')).toBeHidden()
})

test('feedback keeps its heading and message without duplicate status rows', async ({ page }) => {
    await page.evaluate(() => {
        const alert = document.createElement('cb-alert')
        Object.assign(alert, { label: 'Autosave paused', value: 'Reconnect to keep editing.', status: 'Offline' })
        document.querySelector('#fixture')?.append(alert)
    })
    await expect(page.locator('cb-alert [part~=status-title]')).toHaveText('Autosave paused')
    await expect(page.locator('cb-alert [part~=status-copy]')).toHaveText('Reconnect to keep editing. · Offline')
    await expect(page.locator('cb-alert [part~=label-row]')).toHaveCount(0)
})
