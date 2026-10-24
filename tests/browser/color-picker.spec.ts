import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

interface ColorPickerElement extends HTMLElement {
    value: string
    native: boolean
    open: boolean
    swatches: readonly string[]
    recentColors: readonly string[]
    updateSwatch(previousValue: string, value?: string): boolean
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

test('color plane changes color without leaking an empty button action', async ({ page }) => {
    const picker = page.locator('cb-color-picker')
    await picker.getByRole('button',{name:'Choose fill color',exact:true}).click()
    await picker.evaluate(node => {
        node.dataset.actions = '0'
        node.dataset.changes = '0'
        node.addEventListener('action',() => { node.dataset.actions = String(Number(node.dataset.actions) + 1) })
        node.addEventListener('change',() => { node.dataset.changes = String(Number(node.dataset.changes) + 1) })
    })
    await picker.getByLabel('Saturation and brightness',{exact:true}).click({position:{x:20,y:20}})
    await expect(picker).not.toHaveAttribute('data-changes','0')
    await expect(picker).toHaveAttribute('data-actions','0')
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

test('color changes retain popup positioning next to a right-edge trigger', async ({ page }) => {
    const picker = page.locator('cb-color-picker')
    await picker.evaluate(element => { element.style.cssText = 'position:fixed;right:24px;top:40px' })
    await picker.getByRole('button', { name: 'Choose fill color', exact: true }).click()
    const popup = picker.getByRole('dialog'), before = (await popup.boundingBox())!
    for (const color of ['#004aff', '#ff000080', '#112233']) {
        await picker.getByRole('textbox', { name: 'HEX', exact: true }).fill(color)
        await expect(picker).toHaveJSProperty('value', color)
        await expect(popup).toHaveCSS('position', 'fixed')
        await expect.poll(async () => Math.abs((await popup.boundingBox())!.x - before.x)).toBeLessThanOrEqual(1)
        await expect.poll(async () => Math.abs((await popup.boundingBox())!.y - before.y)).toBeLessThanOrEqual(1)
    }
    await picker.getByLabel('Saturation and brightness', { exact: true }).click({ position: { x: 20, y: 20 } })
    await expect.poll(async () => Math.abs((await popup.boundingBox())!.x - before.x)).toBeLessThanOrEqual(1)
    await expect.poll(async () => Math.abs((await popup.boundingBox())!.y - before.y)).toBeLessThanOrEqual(1)
})

test('saved swatches update through an opt-in action and external palettes refresh reactively', async ({ page }) => {
    const picker = page.locator('cb-color-picker')
    await picker.evaluate(element => {
        element.setAttribute('update-swatch-label', 'Update selected swatch')
        element.addEventListener('swatchupdate', () => { element.dataset.updates = String(Number(element.dataset.updates || 0) + 1) })
    })
    await picker.getByRole('button', { name: 'Choose fill color', exact: true }).click()
    await expect(picker.getByRole('button', { name: 'Update selected swatch', exact: true })).toBeHidden()
    await picker.getByRole('button', { name: 'Saved and recent colors: #db2777', exact: true }).click()
    await expect(picker.getByRole('button', { name: 'Update selected swatch', exact: true })).toBeDisabled()
    await picker.getByRole('textbox', { name: 'HEX', exact: true }).fill('#abcdef')
    await picker.getByRole('button', { name: 'Update selected swatch', exact: true }).click()
    await expect(picker).toHaveAttribute('data-updates', '1')
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: #db2777', exact: true })).toHaveCount(0)
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: #abcdef', exact: true })).toBeFocused()
    await picker.getByRole('textbox', { name: 'HEX', exact: true }).press('Escape')
    await picker.getByRole('button', { name: 'Choose fill color', exact: true }).click()
    await expect(picker.getByRole('button', { name: 'Update selected swatch', exact: true })).toBeHidden()
    await picker.evaluate(element => element.setAttribute('swatches', '["#123456"]'))
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: #123456', exact: true })).toBeVisible()
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: #abcdef', exact: true })).toHaveCount(0)
})

test('swatch updates validate colors, honor cancellation and read-only, and deduplicate replacements', async ({ page }) => {
    const picker = page.locator('cb-color-picker')
    await picker.evaluate(element => {
        const control = element as ColorPickerElement
        element.addEventListener('beforeswatchupdate', event => event.preventDefault(), { once: true })
        element.dataset.cancelled = String(control.updateSwatch('#db2777', '#abcdef'))
    })
    await expect(picker).toHaveAttribute('data-cancelled', 'false')
    await expect(picker).toHaveJSProperty('swatches', ['#2563eb', '#7c3aed', '#db2777'])
    await expect(picker.evaluate(element => (element as ColorPickerElement).updateSwatch('#db2777', 'invalid'))).resolves.toBe(false)
    await expect(picker.evaluate(element => (element as ColorPickerElement).updateSwatch('#112233', '#abcdef'))).resolves.toBe(false)
    await expect(picker.evaluate(element => (element as ColorPickerElement).updateSwatch('#db2777', '#2563eb'))).resolves.toBe(true)
    await expect(picker).toHaveJSProperty('swatches', ['#2563eb', '#7c3aed'])
    await picker.evaluate(element => element.setAttribute('read-only', 'true'))
    await expect(picker.evaluate(element => (element as ColorPickerElement).updateSwatch('#2563eb', '#abcdef'))).resolves.toBe(false)
})

test('edits color, saves and removes swatches, supports keyboard movement and native opt-in', async ({ page }) => {
    const picker = page.locator('cb-color-picker'), trigger = picker.getByRole('button', { name: 'Choose fill color', exact: true })
    await picker.evaluate(element => {
        element.addEventListener('swatchadd', () => { element.dataset.swatchAddCount = String(Number(element.dataset.swatchAddCount ?? 0) + 1) })
        element.addEventListener('swatchremove', () => { element.dataset.swatchRemoveCount = String(Number(element.dataset.swatchRemoveCount ?? 0) + 1) })
    })
    await trigger.click()
    const hue = picker.getByLabel('Hue', { exact: true }).first()
    const initialSwatches = await picker.evaluate(element => [...(element as ColorPickerElement).swatches])
    await hue.press('ArrowRight')
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).recentColors)).toEqual([])
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).swatches)).toEqual(initialSwatches)
    await expect(picker).not.toHaveAttribute('data-swatch-add-count')
    await picker.getByLabel('HEX', { exact: true }).fill('#ff000080')
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).value)).toBe('#ff000080')
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).recentColors)).toEqual([])
    await picker.getByRole('button', { name: 'Add current color' }).click()
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).swatches)).toContain('#ff000080')
    await expect(picker).toHaveAttribute('data-swatch-add-count', '1')
    await expect(picker.getByRole('button', { name: 'Saved and recent colors: #ff000080' })).toBeFocused()
    const before = await picker.evaluate(element => (element as ColorPickerElement).value)
    await picker.getByLabel('Saturation and brightness', { exact: true }).press('ArrowLeft')
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).value)).not.toBe(before)
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).recentColors)).toEqual([])
    const removable = picker.getByRole('button', { name: 'Saved and recent colors: #db2777' })
    await removable.click()
    await expect.poll(() => picker.evaluate(element => (element as ColorPickerElement).recentColors)).toEqual([])
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
