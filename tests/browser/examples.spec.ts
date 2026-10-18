import { expect, test } from '@playwright/test'

const examples = [
    ['multi-selection', 'compact'],
    ['autocomplete', 'compact'],
    ['native-form-controls', 'compact'],
    ['dimensions', 'standard'],
    ['field-states', 'compact'],
    ['input-masks', 'compact'],
    ['box-model', 'standard'],
    ['layout-controls', 'standard'],
    ['styling-controls', 'standard'],
    ['typography-controls', 'standard'],
    ['inspector-panel', 'wide'],
    ['asset-browser', 'wide'],
    ['resource-table', 'wide'],
    ['settings-accordion', 'standard'],
    ['canvas-selection', 'wide'],
    ['publish-flow', 'compact'],
    ['feedback-states', 'standard'],
    ['review-workflow', 'compact'],
    ['editor-workspace', 'wide'],
    ['global-modal-system', 'compact'],
    ['global-flashbar-system', 'compact'],
] as const

for (const [id, size] of examples) {
    test(`example ${id} renders a themed, responsive ${size} surface`, async ({ page }) => {
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=examples--${id}&viewMode=story`)
        const surface = page.locator(`[data-example-surface="${size}"]`)
        await expect(surface).toBeVisible({ timeout: 20_000 })
        await expect(surface.locator('cb-theme-provider')).toHaveCount(0)
        await expect(surface.locator('*').filter({ visible: true }).first()).toBeVisible()

        const desktop = await surface.evaluate(element => {
            const bounds = element.getBoundingClientRect()
            const style = getComputedStyle(element)
            const componentCount = [...element.querySelectorAll('*')].filter(node => node.localName.startsWith('cb-')).length
            return {
                componentCount,
                width: bounds.width,
                viewportWidth: document.documentElement.clientWidth,
                documentWidth: document.documentElement.scrollWidth,
                borderStyle: style.borderTopStyle,
                borderColor: style.borderTopColor,
                backgroundColor: style.backgroundColor,
            }
        })
        expect(desktop.componentCount).toBeGreaterThan(0)
        expect(desktop.width).toBeGreaterThan(0)
        expect(desktop.width).toBeLessThanOrEqual(desktop.viewportWidth)
        expect(desktop.documentWidth).toBeLessThanOrEqual(desktop.viewportWidth + 1)
        expect(desktop.borderStyle).toBe('solid')
        expect(desktop.borderColor).not.toBe('rgba(0, 0, 0, 0)')
        expect(desktop.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')

        await page.setViewportSize({ width: 390, height: 844 })
        await expect(surface).toBeVisible()
        const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(mobileOverflow).toBeLessThanOrEqual(1)
    })
}

test('rich resource table keeps custom cells aligned and nested rows compact', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--resource-table&viewMode=story')
    const table = page.locator('cb-table')
    await expect(table.getByRole('table', { name: 'Project resources' })).toBeVisible({ timeout: 20_000 })
    const columns = ['name', 'status', 'owner', 'updated', 'actions'] as const
    for (const column of columns) {
        const header = table.locator(`th[data-column-id="${column}"]`)
        const cell = table.locator(`[part~="data-row"] td[data-column-id="${column}"]`).first()
        const geometry = await Promise.all([header, cell].map(locator => locator.evaluate(element => {
            const bounds = element.getBoundingClientRect()
            return { x: bounds.x, width: bounds.width }
        })))
        expect(Math.abs(geometry[0]!.x - geometry[1]!.x)).toBeLessThan(1)
        expect(Math.abs(geometry[0]!.width - geometry[1]!.width)).toBeLessThan(1)
    }
    const rowHeights = await table.locator('[part~="data-row"]').evaluateAll(rows => rows.map(row => row.getBoundingClientRect().height))
    expect(Math.max(...rowHeights)).toBeLessThanOrEqual(48)
    const parentX = await table.locator('tr[data-row-key="website"] [part~="cell-content"]').evaluate(element => element.getBoundingClientRect().x)
    const childX = await table.locator('tr[data-row-key="home"] [part~="cell-content"]').evaluate(element => element.getBoundingClientRect().x)
    expect(childX - parentX).toBeGreaterThanOrEqual(24)
})

test('example field popups use the top layer without changing the example surface height', async ({ page }) => {
    for (const [id, controlName, popupPart] of [
        ['multi-selection', /^Project members:/, 'popup'],
        ['autocomplete', 'Add a command', 'popup'],
    ] as const) {
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=examples--${id}&viewMode=story`)
        const surface = page.locator('[data-example-surface]')
        await expect(surface).toBeVisible({ timeout: 20_000 })
        const heightBefore = await surface.evaluate(element => element.getBoundingClientRect().height)
        const control = page.getByRole(id === 'autocomplete' ? 'combobox' : 'button', { name: controlName })
        await control.click()
        const popup = surface.locator(`[part~="${popupPart}"]`).last()
        await expect(popup).toBeVisible()
        const geometry = await popup.evaluate(element => {
            const bounds = element.getBoundingClientRect()
            return {
                topLayer: element.matches(':popover-open'),
                position: getComputedStyle(element).position,
                left: bounds.left,
                top: bounds.top,
                right: bounds.right,
                bottom: bounds.bottom,
                viewportWidth: innerWidth,
                viewportHeight: innerHeight,
            }
        })
        expect(geometry.topLayer).toBe(true)
        expect(geometry.position).toBe('fixed')
        expect(geometry.left).toBeGreaterThanOrEqual(0)
        expect(geometry.top).toBeGreaterThanOrEqual(0)
        expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth)
        expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight)
        expect(await surface.evaluate(element => element.getBoundingClientRect().height)).toBeCloseTo(heightBefore, 0)
        await page.keyboard.press('Escape')
        await expect(popup).toBeHidden()
    }
})

test('layout examples preserve their intended composition instead of collapsing to min-content', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--dimensions&viewMode=story')
    const controls = page.locator('cb-grid')
    await expect(controls).toBeVisible({ timeout: 20_000 })
    const controlsLayout = await controls.evaluate(element => {
        const children = [...element.children].map(child => child.getBoundingClientRect())
        return {
            width: element.getBoundingClientRect().width,
            columns: getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length,
            columnGap: getComputedStyle(element).columnGap,
            rowGap: getComputedStyle(element).rowGap,
            firstTop: children[0]?.top,
            secondTop: children[1]?.top,
        }
    })
    expect(controlsLayout.width).toBeGreaterThan(600)
    expect(controlsLayout.columns).toBeGreaterThanOrEqual(3)
    expect(controlsLayout.columnGap).toBe('12px')
    expect(controlsLayout.rowGap).toBe('12px')
    expect(controlsLayout.firstTop).toBeCloseTo(controlsLayout.secondTop ?? 0, 0)

    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--box-model&viewMode=story')
    const propertyGrid = page.locator('cb-grid')
    await expect(propertyGrid).toBeVisible({ timeout: 20_000 })
    const columns = await propertyGrid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean))
    expect(columns).toHaveLength(2)

    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--asset-browser&viewMode=story')
    const cards = page.locator('cb-card')
    await expect(cards).toHaveCount(3)
    const cardLayout = await cards.evaluateAll(elements => elements.map(element => {
        const bounds = element.getBoundingClientRect()
        return { top: bounds.top, width: bounds.width }
    }))
    expect(new Set(cardLayout.map(card => Math.round(card.top))).size).toBe(1)
    expect(cardLayout.every(card => card.width > 250)).toBe(true)
})

test('examples respond to the Storybook dark appearance global', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--multi-selection&viewMode=story&globals=appearance:dark')
    const surface = page.locator('[data-example-surface]')
    await expect(surface).toBeVisible({ timeout: 20_000 })
    await expect(page.locator('cb-theme-provider')).toHaveCSS('color-scheme', 'dark')
    expect(await surface.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe('rgb(255, 255, 255)')
})
