import { expect, test } from '@playwright/test'
import type { Select } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

test('select variants and logical caret placement do not change option direction or selection', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-select')))
    await page.evaluate(() => {
        const select = document.createElement('cb-select') as Select
        Object.assign(select, { accessibleLabel: 'Device', variant: 'ghost', options: [{ value: 'desktop', label: 'Desktop', icon: 'layers' }, { value: 'mobile', label: 'Mobile' }], value: 'desktop' } satisfies Partial<Select>)
        document.getElementById('fixture')!.append(select)
    })
    const host = page.locator('cb-select'), trigger = host.locator('[part~=trigger]')
    for (const variant of ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const) {
        await host.evaluate((node, variant) => { (node as Select).variant = variant }, variant)
        await expect(trigger).toHaveJSProperty('variant', variant)
    }
    await host.evaluate(node => { (node as Select).variant = 'ghost' })
    await expect(trigger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    for (const direction of ['ltr', 'rtl']) for (const position of ['start', 'end'] as const) {
        await host.evaluate((node, settings) => { node.setAttribute('dir', settings.direction); (node as Select).caretPosition = settings.position }, { direction, position })
        await expect.poll(async () => {
            const caret = await trigger.locator('cb-icon[part~=indicator]').boundingBox(), value = await trigger.locator('[part~=value-content]').boundingBox()
            return !!caret && !!value && ((direction === 'ltr') === (position === 'start') ? caret.x + caret.width <= value.x + 1 : caret.x >= value.x + value.width - 1)
        }).toBe(true)
        await trigger.click()
        await expect(host.getByRole('listbox')).toHaveCSS('direction', direction)
        await host.getByRole('option', { name: 'Mobile', exact: true }).click()
        await expect(host).toHaveJSProperty('value', 'mobile')
    }
})

componentContract('cb-select', 'form--select', async ({ page, host }) => {
    await host.evaluate(node => { Object.assign(node, { native: true, options: [{ value: 'release', label: 'Release choice' }], value: 'release' } satisfies Partial<Select>) })
    await expect(host.locator('select').first()).toHaveValue('release')
    await host.evaluate(node => { Object.assign(node, { options: [{ value: 'draft', label: 'Draft choice' }], value: 'draft' } satisfies Partial<Select>) })
    await expect(host.locator('select').first()).toHaveValue('draft')
    await expect(host.locator('option[value="draft"]')).toHaveText('Draft choice')
    await host.evaluate(node => { Object.assign(node, { size: 'md' } satisfies Partial<Select>) })
    await expect(host.locator('cb-button[part~="trigger"]')).toHaveAttribute('size', 'md')
    await expect(host.locator('cb-button[part~="trigger"]')).toHaveAttribute('data-size', 'md')
    await host.evaluate(node => { Object.assign(node, { native: false, options: [
        { value: 'element', label: 'Container', icon: 'layers' },
        { value: 'component', label: 'Card', icon: 'component' },
    ], value: 'element' } satisfies Partial<Select>) })
    const trigger = host.getByRole('button', { name: /Container/ })
    await expect(trigger.locator('cb-icon[name="layers"]')).toBeVisible()
    await trigger.click()
    const card = page.getByRole('option', { name: 'Card', exact: true })
    await expect(card.locator('cb-icon[name="component"]')).toBeVisible()
    await card.click()
    await expect(host.getByRole('button', { name: /Card/ }).locator('cb-icon[name="component"]')).toBeVisible()
})
