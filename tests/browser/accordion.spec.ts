import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-accordion')))
}

async function mountAccordion(page: Page): Promise<void> {
    await page.evaluate(() => {
        const accordion = document.createElement('cb-accordion') as HTMLElement & Record<string, unknown>
        Object.assign(accordion, {
            label: 'Page settings',
            items: [
                { id: 'content', label: 'Content', description: 'Page copy and metadata', expanded: true, content: 'Content controls' },
                { id: 'appearance', label: 'Appearance', content: 'Theme controls', actions: [{ id: 'reset', label: 'Reset appearance', icon: 'reset' }] },
                { id: 'publishing', label: 'Publishing', disabled: true, disabledReason: 'Unavailable until this page is saved' },
            ],
            emptyLabel: 'No settings available',
        })
        document.querySelector('#fixture')?.append(accordion)
    })
}

test('expands one item at a time, exposes actions, disabled reasons and semantic state', async ({ page }) => {
    await start(page)
    await mountAccordion(page)
    const accordion = page.locator('cb-accordion')
    const content = accordion.getByRole('button', { name: /Content/ })
    const appearance = accordion.getByRole('button', { name: 'Appearance', exact: true })
    await expect(content).toHaveAttribute('aria-expanded', 'true')
    await expect(accordion.getByRole('region', { name: /Content/ })).toContainText('Content controls')

    const expansion = page.evaluate(() => new Promise<{ id: string; expandedIds: readonly string[] }>(resolve => {
        document.querySelector('cb-accordion')?.addEventListener('cb-expansion-change', event => {
            const detail = (event as CustomEvent<{ id: string; expandedIds: readonly string[] }>).detail
            resolve({ id: detail.id, expandedIds: detail.expandedIds })
        }, { once: true })
    }))
    await appearance.click()
    await expect(expansion).resolves.toEqual({ id: 'appearance', expandedIds: ['appearance'] })
    await expect(content).toHaveAttribute('aria-expanded', 'false')
    await expect(appearance).toHaveAttribute('aria-expanded', 'true')

    const action = page.evaluate(() => new Promise<string>(resolve => {
        document.querySelector('cb-accordion')?.addEventListener('cb-item-action', event => {
            resolve((event as CustomEvent<{ actionId: string }>).detail.actionId)
        }, { once: true })
    }))
    await accordion.getByRole('button', { name: 'Reset appearance' }).click()
    await expect(action).resolves.toBe('reset')
    await expect(accordion.getByRole('button', { name: 'Publishing' })).toBeDisabled()
    await expect(accordion.getByText('Unavailable until this page is saved')).toBeVisible()
})

test('supports multiple panels, cancellation, public controls and preserves rendered nodes', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const accordion = document.createElement('cb-accordion') as HTMLElement & Record<string, unknown>
        const input = document.createElement('input')
        input.value = 'Preserved value'
        Object.assign(accordion, {
            label: 'Settings', multiple: true, collapsible: true,
            items: [
                { id: 'one', label: 'One', expanded: true, content: input },
                { id: 'two', label: 'Two', content: 'Second panel' },
            ],
        })
        accordion.addEventListener('cb-before-expansion-change', event => {
            if ((event as CustomEvent<{ id: string }>).detail.id === 'two' && accordion.dataset.block === 'true') event.preventDefault()
        })
        document.querySelector('#fixture')?.append(accordion)
    })
    const accordion = page.locator('cb-accordion')
    await accordion.evaluate(element => { element.dataset.block = 'true' })
    await accordion.getByRole('button', { name: 'Two' }).click()
    await expect(accordion.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-expanded', 'false')
    await accordion.evaluate(element => {
        element.dataset.block = 'false'
        ;(element as HTMLElement & { expandAll(): boolean }).expandAll()
    })
    await expect(accordion.getByRole('button', { name: 'One' })).toHaveAttribute('aria-expanded', 'true')
    await expect(accordion.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-expanded', 'true')

    const preserved = await accordion.evaluate(element => {
        const original = element.shadowRoot?.querySelector('input')
        const target = element as HTMLElement & { items: readonly object[] }
        target.items = target.items.map((item, index) => index === 0 ? { ...item, label: 'First' } : item)
        return original === element.shadowRoot?.querySelector('input')
    })
    await expect(accordion.getByRole('button', { name: 'First' })).toBeVisible()
    await expect(accordion.locator('input')).toHaveValue('Preserved value')
    expect(preserved).toBe(true)
})

test('moves focus with arrow, home and end keys while skipping disabled items', async ({ page }) => {
    await start(page)
    await mountAccordion(page)
    const accordion = page.locator('cb-accordion')
    await accordion.getByRole('button', { name: /Content/ }).focus()
    await page.keyboard.press('ArrowDown')
    await expect(accordion.getByRole('button', { name: 'Appearance', exact: true })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(accordion.getByRole('button', { name: /Content/ })).toBeFocused()
    await page.keyboard.press('End')
    await expect(accordion.getByRole('button', { name: 'Appearance', exact: true })).toBeFocused()
    await page.keyboard.press('Home')
    await expect(accordion.getByRole('button', { name: /Content/ })).toBeFocused()
})

test('has no automatic accessibility violations', async ({ page }) => {
    await start(page)
    await mountAccordion(page)
    const results = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(results.violations).toEqual([])
})
