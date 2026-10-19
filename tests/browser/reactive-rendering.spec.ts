import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-calendar')))
})

test('calendar bindings react without a DOM synchronization hook', async ({ page }) => {
    await page.evaluate(() => {
        const calendar = document.createElement('cb-calendar')
        Object.assign(calendar, { value: '2026-10-19', label: 'Appointment', previousLabel: 'Previous month', nextLabel: 'Next month' })
        document.querySelector('#fixture')?.append(calendar)
    })
    const calendar = page.locator('cb-calendar')
    await expect(calendar.locator('[part~=calendar]')).toHaveAttribute('aria-label', 'Appointment')
    await expect(calendar.locator('[part~=month]')).toHaveText('October 2026')
    await expect(calendar.locator('[part~=weekday]').first()).toHaveText('Sun')
    await calendar.evaluate(element => {
        Object.defineProperty(element, 'syncView', { value: () => undefined })
        Object.assign(element, { firstDayOfWeek: 1, value: '2026-11-10', nextLabel: 'Forward one month', accessibleLabel: 'Choose appointment' })
    })
    await expect(calendar.locator('[part~=month]')).toHaveText('November 2026')
    await expect(calendar.locator('[part~=weekday]').first()).toHaveText('Mon')
    await expect(calendar.getByRole('button', { name: 'Forward one month' })).toBeVisible()
    await expect(calendar.locator('[part~=calendar]')).toHaveAttribute('aria-label', 'Choose appointment')
    const selected = calendar.locator('cb-button[data-value="2026-11-10"]')
    await expect(selected).toHaveAttribute('aria-pressed', 'true')
    await selected.evaluate(element => element.setAttribute('data-preserved', 'yes'))
    await calendar.evaluate(element => { Object.assign(element, { disabled: true }) })
    await expect(selected).toHaveAttribute('data-preserved', 'yes')
    await expect(selected).toHaveAttribute('aria-disabled', 'true')
})

test('table selection, cells and hierarchy update through template bindings', async ({ page }) => {
    await page.evaluate(() => {
        const table = document.createElement('cb-table')
        Object.assign(table, {
            label: 'Projects', selectionMode: 'multiple', itemKey: 'id', childrenBy: 'children',
            selectAllLabel: 'Select all', deselectAllLabel: 'Deselect all', selectRowLabel: 'Select {row}', deselectRowLabel: 'Deselect {row}',
            expandRowLabel: 'Expand {row}', collapseRowLabel: 'Collapse {row}',
            columns: [{ id: 'name', field: 'name', header: 'Name' }],
            items: [{ id: 'parent', name: 'Parent', children: [{ id: 'child', name: 'Child' }] }],
        })
        document.querySelector('#fixture')?.append(table)
    })
    const table = page.locator('cb-table')
    await expect(table.getByText('Parent', { exact: true })).toBeVisible()
    await expect(table.getByText('Child', { exact: true })).toHaveCount(0)
    await table.evaluate(element => {
        Object.defineProperty(element, 'syncView', { value: () => undefined })
        Object.assign(element, { expandedKeys: ['parent'], selectedKeys: ['child'] })
    })
    await expect(table.getByText('Child', { exact: true })).toBeVisible()
    await expect(table.locator('tr[data-row-key="child"] input')).toBeChecked()
    await table.evaluate(element => Object.assign(element, { columns: [{ id: 'name', field: 'name', header: 'Project name' }] }))
    await expect(table.getByRole('columnheader', { name: 'Project name' })).toBeVisible()
})

test('color editor presentation responds directly to value and label changes', async ({ page }) => {
    await page.evaluate(() => {
        const picker = document.createElement('cb-color-picker')
        Object.assign(picker, { value: '#ff0000', label: 'Fill', hexLabel: 'HEX', hueLabel: 'Hue', alphaLabel: 'Alpha' })
        document.querySelector('#fixture')?.append(picker)
    })
    const picker = page.locator('cb-color-picker')
    await picker.getByRole('button', { name: 'Fill', exact: true }).click()
    await picker.evaluate(element => {
        Object.defineProperty(element, 'syncView', { value: () => undefined })
        Object.assign(element, { value: '#00ff00', hexLabel: 'Color code' })
    })
    await expect(picker.getByRole('textbox', { name: 'Color code' })).toHaveValue('#00ff00')
    await expect(picker.locator('[part~=hue-slider]')).toHaveValue('120')
    await expect(picker.locator('[part~=popup]')).toHaveCSS('--cb-hue-color', 'hsl(120,100%,50%)')
})

test('Storybook color picker opens and edits with its complete control args', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=styling--color-picker&viewMode=story')
    const picker = page.locator('cb-color-picker')
    await picker.getByRole('button', { name: 'Choose fill color', exact: true }).click()
    await expect(picker.getByRole('dialog', { name: 'Choose fill color' })).toBeVisible()
    const count = await picker.locator('[part~=swatch]').count()
    await picker.getByRole('slider', { name: 'Hue', exact: true }).fill('120')
    await expect(picker.getByRole('textbox', { name: 'HEX', exact: true })).not.toHaveValue('#2563ebcc')
    await expect(picker.locator('[part~=swatch]')).toHaveCount(count)
    await picker.getByRole('button', { name: 'Add current color' }).click()
    await expect(picker.locator('[part~=swatch]')).toHaveCount(count + 1)
})
