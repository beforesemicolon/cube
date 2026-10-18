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

test('button group owns its buttons and renders one continuous control', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const group = document.createElement('cb-button-group') as HTMLElement & {
            items: Array<{ id: string; label: string; disabled?: boolean }>
            accessibleLabel: string
        }
        group.accessibleLabel = 'Clipboard actions'
        group.items = [{ id: 'copy', label: 'Copy' }, { id: 'paste', label: 'Paste' }, { id: 'duplicate', label: 'Duplicate', disabled: true }]
        group.addEventListener('cb-action', () => { group.dataset.actionCount = String(Number(group.dataset.actionCount ?? 0) + 1) })
        document.querySelector('#fixture')?.append(group)
    })
    const group = page.getByRole('group', { name: 'Clipboard actions' })
    await expect(group.getByRole('button')).toHaveCount(3)
    await expect(group.getByRole('button', { name: 'Duplicate' })).toBeDisabled()
    await group.getByRole('button', { name: 'Copy' }).click()
    await expect(page.locator('cb-button-group')).toHaveAttribute('data-action-count', '1')
    expect(await page.locator('cb-button-group').evaluate(element => element.childElementCount)).toBe(0)
    const geometry = await group.getByRole('button').evaluateAll(buttons => buttons.map(button => {
        const style = getComputedStyle(button)
        const box = button.getBoundingClientRect()
        return { left: box.left, right: box.right, startStart: style.borderStartStartRadius, startEnd: style.borderStartEndRadius }
    }))
    expect(geometry[1]?.left).toBeLessThanOrEqual((geometry[0]?.right ?? 0) + 0.1)
    expect(geometry[0]?.startEnd).toBe('0px')
    expect(geometry[1]?.startStart).toBe('0px')
    await page.locator('cb-button-group').evaluate(element => { (element as HTMLElement & { orientation: string }).orientation = 'vertical' })
    const verticalGeometry = await group.getByRole('button').evaluateAll(buttons => buttons.map(button => {
        const style = getComputedStyle(button)
        const box = button.getBoundingClientRect()
        return { top: box.top, bottom: box.bottom, startStart: style.borderStartStartRadius, endStart: style.borderEndStartRadius }
    }))
    expect(verticalGeometry[1]?.top).toBeLessThanOrEqual((verticalGeometry[0]?.bottom ?? 0) + 0.1)
    expect(verticalGeometry[0]?.endStart).toBe('0px')
    expect(verticalGeometry[1]?.startStart).toBe('0px')
    const audit = await new AxeBuilder({ page }).include('cb-button-group').analyze()
    expect(audit.violations).toEqual([])
})

test('split button joins its primary and menu trigger into one control', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const split = document.createElement('cb-split-button') as HTMLElement & { label: string; menuLabel: string; items: Array<{ id: string; label: string }> }
        split.label = 'Create'; split.menuLabel = 'More create actions'; split.items = [{ id: 'page', label: 'Page' }]
        split.addEventListener('cb-action', () => { split.dataset.actionCount = String(Number(split.dataset.actionCount ?? 0) + 1) })
        document.querySelector('#fixture')?.append(split)
    })
    const buttons = page.locator('cb-split-button').getByRole('button')
    await expect(buttons).toHaveCount(2)
    const geometry = await buttons.evaluateAll(controls => controls.map(control => {
        const style = getComputedStyle(control)
        const box = control.getBoundingClientRect()
        return { left: box.left, right: box.right, startStart: style.borderStartStartRadius, startEnd: style.borderStartEndRadius }
    }))
    expect(geometry[1]?.left).toBeLessThanOrEqual((geometry[0]?.right ?? 0) + 0.1)
    expect(geometry[0]?.startEnd).toBe('0px')
    expect(geometry[1]?.startStart).toBe('0px')
    await buttons.first().click()
    await expect(page.locator('cb-split-button')).toHaveAttribute('data-action-count', '1')
    const audit = await new AxeBuilder({ page }).include('cb-split-button').analyze()
    expect(audit.violations).toEqual([])
})

test('dropdown, menu, pagination and tooltip expose canonical accessible interactions', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const dropdown = document.createElement('cb-dropdown') as HTMLElement & { label: string; items: Array<{ id: string; label: string }> }
        dropdown.label = 'Add element'; dropdown.items = [{ id: 'text', label: 'Text' }, { id: 'image', label: 'Image' }]
        const pagination = document.createElement('cb-pagination') as HTMLElement & { page: number; totalPages: number; accessibleLabel: string; previousLabel: string; nextLabel: string; pageLabel: string }
        pagination.page = 2; pagination.totalPages = 12; pagination.accessibleLabel = 'Results pages'; pagination.previousLabel = 'Previous page'; pagination.nextLabel = 'Next page'; pagination.pageLabel = 'Page {page}'
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
