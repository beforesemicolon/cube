import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-command-palette')))
}

test('all action tags register and expose a headless-safe default', async ({ page }) => {
    await start(page)
    const names = ['split-button', 'button-group', 'segmented-control', 'tabs', 'breadcrumb', 'menu', 'context-menu', 'dropdown', 'command-palette', 'toolbar', 'action-bar', 'pagination', 'tooltip', 'shortcut']
    expect(await page.evaluate(values => values.every(name => Boolean(customElements.get(`cb-${name}`))), names)).toBe(true)
    await page.evaluate(values => { for (const name of values) document.querySelector('#fixture')?.append(document.createElement(`cb-${name}`)) }, names)
    expect(await page.evaluate(() => Array.from(document.querySelectorAll('#fixture > *')).every(node => node.shadowRoot?.querySelector('[part]')))).toBe(true)
})
test('segmented control and tabs support selection and keyboard roving focus', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const segmented = document.createElement('cb-segmented-control') as HTMLElement & { items: Array<{ id: string; label: string }>; value: string; accessibleLabel: string }
        segmented.items = [{ id: 'design', label: 'Design' }, { id: 'preview', label: 'Preview' }, { id: 'code', label: 'Code' }]
        segmented.value = 'design'; segmented.accessibleLabel = 'Editor view'
        const tabs = document.createElement('cb-tabs') as HTMLElement & { items: Array<{ id: string; label: string }>; value: string; accessibleLabel: string }
        tabs.items = segmented.items; tabs.value = 'design'; tabs.accessibleLabel = 'Inspector sections'
        document.querySelector('#fixture')?.append(segmented, tabs)
    })
    const radio = page.getByRole('radio', { name: 'Design' }); await radio.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('Space')
    await expect(page.getByRole('radio', { name: 'Preview' })).toHaveAttribute('aria-checked', 'true')
    const tab = page.getByRole('tab', { name: 'Design' }); await tab.focus(); await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true')
})

test('dropdown, menu, pagination and tooltip expose canonical accessible interactions', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const dropdown = document.createElement('cb-dropdown') as HTMLElement & { label: string; items: Array<{ id: string; label: string }> }
        dropdown.label = 'Add element'; dropdown.items = [{ id: 'text', label: 'Text' }, { id: 'image', label: 'Image' }]
        const pagination = document.createElement('cb-pagination') as HTMLElement & { page: number; totalPages: number }
        pagination.page = 2; pagination.totalPages = 12
        const tooltip = document.createElement('cb-tooltip') as HTMLElement & { content: string }
        tooltip.content = 'Duplicate selection'; const trigger = document.createElement('button'); trigger.textContent = 'Duplicate'; tooltip.append(trigger)
        document.querySelector('#fixture')?.append(dropdown, pagination, tooltip)
    })
    const trigger = page.getByRole('button', { name: 'Add element' }); await trigger.click(); await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('menuitem', { name: 'Text' }).click(); await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await page.getByRole('button', { name: 'Page 3' }).click(); await expect(page.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    await page.getByRole('button', { name: 'Duplicate' }).hover(); await expect(page.getByRole('tooltip')).toBeVisible()
    const audit = await new AxeBuilder({ page }).include('#fixture').analyze(); expect(audit.violations).toEqual([])
})
