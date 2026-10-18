import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

interface ExpandableSectionElement extends HTMLElement {
    label: string
    accessibleLabel: string
    description: string
    counter: string
    expanded: boolean
    variant: 'default' | 'container' | 'footer'
    headingLevel: number
    collapse(originalEvent?: Event): boolean
}

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-expandable-section')))
    await page.evaluate(() => {
        const section = document.createElement('cb-expandable-section') as ExpandableSectionElement
        Object.assign(section, {
            label: 'Chart data', accessibleLabel: 'Chart data — Chart data section', description: 'Values represented by the chart.',
            counter: '3 rows', expanded: false, variant: 'container', headingLevel: 2,
        })
        const content = document.createElement('p'); content.textContent = 'Three data rows'
        const action = document.createElement('cb-button') as HTMLElement & { label: string; variant: string }
        action.label = 'Download'; action.variant = 'ghost'; action.slot = 'header-actions'
        section.append(content, action); document.querySelector('#fixture')?.append(section)
    })
})

test('has a visible labeled trigger, semantic state, header actions and preserved content', async ({ page }) => {
    const section = page.locator('cb-expandable-section')
    const trigger = section.getByRole('button', { name: /^Chart data/ })
    await expect(section.locator('[part~="trigger"] [part~="label"]').first()).toHaveText('Chart data')
    await expect(section.locator('[part~="counter"]')).toHaveText('3 rows')
    await expect(section.getByRole('heading', { level: 2 })).toContainText('Chart data')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(section.getByText('Three data rows')).toBeHidden()
    await trigger.focus(); await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(section.getByText('Three data rows')).toBeVisible()
    await section.getByRole('button', { name: 'Download', exact: true }).click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
})

test('supports cancelable expansion changes and public state controls', async ({ page }) => {
    const section = page.locator('cb-expandable-section'), trigger = section.getByRole('button', { name: /^Chart data/ })
    await trigger.click()
    await section.evaluate(element => element.addEventListener('cb-before-expansion-change', event => event.preventDefault()))
    await trigger.click(); await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const collapsed = await section.evaluate(element => (element as ExpandableSectionElement).collapse())
    expect(collapsed).toBe(false)
    const accessibility = await new AxeBuilder({ page }).include('cb-expandable-section').analyze()
    expect(accessibility.violations).toEqual([])
})
