import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

interface ColorPickerElement extends HTMLElement {
    value: string
    native: boolean
    open: boolean
    swatches: readonly string[]
    recentColors: readonly string[]
}

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-color-picker')))
    await page.evaluate(() => {
        const picker = document.createElement('cb-color-picker') as ColorPickerElement & {
            label: string; accessibleLabel: string; allowAlpha: boolean; allowSampler: boolean; swatches: readonly string[]
            hueLabel: string; saturationLabel: string; valueLabel: string; alphaLabel: string; redLabel: string; greenLabel: string; blueLabel: string
            hexLabel: string; planeLabel: string; samplerLabel: string; closeLabel: string; swatchesLabel: string
            addSwatchLabel: string; removeSwatchLabel: string; transparentLabel: string
        }
        Object.assign(picker, {
            label: 'Fill color', accessibleLabel: 'Choose fill color', value: '#2563ebcc', allowAlpha: true, allowSampler: true,
            swatches: ['#2563eb', '#7c3aed', '#db2777'], hueLabel: 'Hue', saturationLabel: 'Saturation', valueLabel: 'Brightness', alphaLabel: 'Alpha',
            redLabel: 'Red', greenLabel: 'Green', blueLabel: 'Blue', hexLabel: 'HEX', planeLabel: 'Saturation and brightness',
            samplerLabel: 'Sample color from screen', closeLabel: 'Close color picker', swatchesLabel: 'Saved and recent colors',
            addSwatchLabel: 'Add current color', removeSwatchLabel: 'Remove {color} with Delete or Backspace', transparentLabel: 'Transparent',
        })
        document.querySelector('#fixture')?.append(picker)
    })
})

test('opens from a compact swatch and exposes every custom color control', async ({ page }) => {
    const picker = page.locator('cb-color-picker'), trigger = picker.getByRole('button', { name: 'Choose fill color', exact: true })
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).value)).toBe('#2563ebcc')
    await expect(trigger).toBeVisible(); await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(picker.getByRole('dialog', { name: 'Choose fill color' })).toBeVisible()
    for (const name of ['Saturation and brightness', 'Red', 'Green', 'Blue', 'HEX']) await expect(picker.getByLabel(name, { exact: true })).toBeVisible()
    await expect(picker.getByLabel('Hue', { exact: true })).toHaveCount(2); await expect(picker.getByLabel('Alpha', { exact: true })).toHaveCount(2)
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: Transparent' })).toBeVisible()
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: #db2777' })).toBeVisible()
    await expect(picker.getByRole('button', { name: 'Add current color' })).toBeVisible()
    await expect(picker.locator('[part~="preview"]')).toHaveCount(0)
    await expect.poll(() => picker.evaluate(element => {
        const popup = element.shadowRoot?.querySelector('[part~="popup"]')
        return Array.from(popup?.children ?? []).map(child => child.getAttribute('part'))
    })).toEqual(['plane', 'slider-field hue-slider-field', 'slider-field alpha-slider-field', 'toolbar', 'channels hsv-channels', 'channels rgb-channels', 'palette-group'])
})

test('edits color, saves and removes swatches, supports keyboard movement and native opt-in', async ({ page }) => {
    const picker = page.locator('cb-color-picker'), trigger = picker.getByRole('button', { name: 'Choose fill color', exact: true })
    await picker.evaluate(element => {
        element.addEventListener('cb-swatch-add', () => { element.dataset.swatchAddCount = String(Number(element.dataset.swatchAddCount ?? 0) + 1) })
        element.addEventListener('cb-swatch-remove', () => { element.dataset.swatchRemoveCount = String(Number(element.dataset.swatchRemoveCount ?? 0) + 1) })
    })
    await trigger.click()
    await picker.getByLabel('HEX', { exact: true }).fill('#ff000080')
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).value)).toBe('#ff000080')
    await picker.getByRole('button', { name: 'Add current color' }).click()
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).swatches)).toContain('#ff000080')
    await expect(picker).toHaveAttribute('data-swatch-add-count', '1')
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: #ff000080' })).toBeFocused()
    const before = await picker.evaluate(element => (element as ColorPickerElement).value)
    await picker.getByLabel('Saturation and brightness', { exact: true }).press('ArrowLeft')
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).value)).not.toBe(before)
    const removable = picker.getByRole('button', { name: 'Saved and recent colors: #db2777' })
    await removable.click()
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).recentColors[0])).toBe('#db2777')
    await expect(removable).toBeFocused()
    await removable.press('Delete')
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: #db2777' })).toHaveCount(0)
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).swatches)).not.toContain('#db2777')
    await expect(picker).toHaveAttribute('data-swatch-remove-count', '1')
    await picker.evaluate(element => { (element as ColorPickerElement).native = true })
    await expect(picker.locator('[part~="native"]')).toBeVisible()
    await expect(trigger).toBeHidden()
})

test('has no automatic accessibility violations while the editor is open', async ({ page }) => {
    const picker = page.locator('cb-color-picker')
    await picker.getByRole('button', { name: 'Choose fill color', exact: true }).click()
    const results = await new AxeBuilder({ page }).include('cb-color-picker').analyze()
    expect(results.violations).toEqual([])
})
