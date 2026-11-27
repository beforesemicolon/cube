import { expect, test, type Page } from '@playwright/test'
import type { RangeInput, RangeInputChangeDetail } from '../../components/form/range-input/index.js'

async function mount(page: Page, double = true): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.evaluate(async (double) => {
        await customElements.whenDefined('cb-range-input')
        const form = document.createElement('form')
        // Exercise HTML attribute parsing as well as the JavaScript API.
        form.innerHTML = `<cb-range-input name="price" accessible-label="Price"
            min="0" max="10" step="0.5" value="3"
            ${double ? 'variant="double" start-value="2" end-value="8" start-label="From" end-label="To"' : ''}>
        </cb-range-input>`
        const slider = form.querySelector('cb-range-input')
        if (!slider) throw new Error('Missing slider')
        slider.addEventListener('change', (event) => {
            if (!(event instanceof CustomEvent)) throw new Error('Unexpected native event')
            const { value, previousValue, thumb }: RangeInputChangeDetail = event.detail
            slider.setAttribute('data-event', JSON.stringify({ value, previousValue, thumb }))
            slider.setAttribute('data-count', String(Number(slider.getAttribute('data-count')) + 1))
        })
        document.querySelector('#fixture')?.append(form)
    }, double)
}

test('single remains scalar, focusable, and form associated after a variant switch', async ({ page }) => {
    await mount(page, false)
    const host = page.locator('cb-range-input')
    const slider = host.getByRole('slider', { name: 'Price', exact: true })
    await expect(slider).toHaveValue('3')
    await host.evaluate((element: RangeInput) => element.focus())
    await expect(slider).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(slider).toHaveValue('3.5')
    await expect(host).toHaveAttribute('data-event', JSON.stringify({ value: 3.5, previousValue: 3 }))
    const form = page.locator('form')
    expect(await form.evaluate((element: HTMLFormElement) => new FormData(element).getAll('price'))).toEqual(['3.5'])
    await host.evaluate((element: RangeInput) => { element.variant = 'double' })
    await expect(host.getByRole('slider')).toHaveCount(2)
    expect(await host.evaluate((element: RangeInput) => element.rangeValue)).toEqual([0, 10])
    await host.evaluate((element: RangeInput) => { element.variant = 'single' })
    await expect(slider).toHaveValue('3.5')
    await form.evaluate((element: HTMLFormElement) => element.reset())
    await expect(slider).toHaveValue('3')
})

test('double picks both values with keyboard, prevents crossing and honors canceled changes', async ({ page }) => {
    await mount(page)
    const host = page.locator('cb-range-input')
    const start = host.getByRole('slider', { name: 'From', exact: true })
    const end = host.getByRole('slider', { name: 'To', exact: true })
    await expect(start).toHaveValue('2')
    await expect(end).toHaveValue('8')
    await expect(start).toHaveAttribute('aria-valuemax', '8')
    await expect(end).toHaveAttribute('aria-valuemin', '2')
    await page.keyboard.press('Tab')
    await expect(start).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(start).toHaveValue('2.5')
    await expect(host).toHaveAttribute('data-event', JSON.stringify({
        value: [2.5, 8], previousValue: [2, 8], thumb: 'start',
    }))
    await page.keyboard.press('Tab')
    await expect(end).toBeFocused()
    await page.keyboard.press('Home')
    await expect(end).toHaveValue('2.5')
    await expect(start).toHaveValue('2.5')
    await page.keyboard.press('ArrowLeft')
    await expect(end).toHaveValue('2.5')
    await expect(host).toHaveAttribute('data-count', '2')

    await host.evaluate((element: RangeInput) => {
        element.addEventListener('beforechange', (event) => event.preventDefault(), { once: true })
    })
    await page.keyboard.press('End')
    await expect(end).toHaveValue('2.5')
    await expect(host).toHaveAttribute('data-count', '2')
    await page.keyboard.press('End')
    await expect(end).toHaveValue('10')
    await expect(host).toHaveAttribute('data-count', '3')
})

test('double supports track taps, thumb dragging and a highlighted interval', async ({ page }) => {
    await mount(page)
    const host = page.locator('cb-range-input')
    const rail = host.locator('[part="range-rail"]')
    const start = host.getByRole('slider', { name: 'From', exact: true })
    const end = host.getByRole('slider', { name: 'To', exact: true })
    const bounds = await rail.boundingBox()
    if (!bounds) throw new Error('Track not rendered')
    const point = (fraction: number) => ({
        x: bounds.x + bounds.width * fraction,
        y: bounds.y + bounds.height / 2,
    })
    const tap = point(0.1)
    await page.mouse.click(tap.x, tap.y)
    await expect(start).toHaveValue('1')
    await expect(start).toBeFocused()
    const from = point(0.8)
    const to = point(0.9)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y, { steps: 6 })
    await page.mouse.up()
    await expect(end).toHaveValue('9')
    expect(await host.evaluate((element: RangeInput) => element.rangeValue)).toEqual([1, 9])
    const fill = await rail.locator('[part="range-fill"]').boundingBox()
    expect(fill?.width).toBeCloseTo(bounds.width * 0.8, 0)
    await host.evaluate((element: RangeInput) => { element.dir = 'rtl' })
    const rtlTap = point(0.95)
    await page.mouse.click(rtlTap.x, rtlTap.y)
    await expect(start).toHaveValue('0.5')
})

test('double normalizes programmatic values, submits in order, restores and resets', async ({ page }) => {
    await mount(page)
    const host = page.locator('cb-range-input')
    const form = page.locator('form')
    const read = () => form.evaluate((element: HTMLFormElement) => new FormData(element).getAll('price'))
    const start = host.getByRole('slider', { name: 'From', exact: true })
    const end = host.getByRole('slider', { name: 'To', exact: true })
    expect(await read()).toEqual(['2', '8'])
    expect(await host.evaluate((element: RangeInput) => element.setValue(5))).toBe(false)
    expect(await host.evaluate((element: RangeInput) => element.setRangeValue([13, -4]))).toBe(true)
    await expect(start).toHaveValue('0')
    await expect(end).toHaveValue('10')
    expect(await read()).toEqual(['0', '10'])
    await host.evaluate((element: RangeInput) => {
        element.max = 9.9
        element.setRangeValue([3.26, 7.99])
        element.readOnly = true
    })
    await end.press('End')
    await expect(end).toHaveValue('8')
    await expect(end).toHaveAttribute('aria-readonly', 'true')
    expect(await read()).toEqual(['3.5', '8'])
    await host.evaluate((element: RangeInput) => {
        element.readOnly = false
        const saved = new FormData()
        saved.append('price', '4')
        saved.append('price', '9.9')
        element.formStateRestoreCallback(saved, 'restore')
    })
    await expect(start).toHaveValue('4')
    await expect(end).toHaveValue('9.5')
    expect(await read()).toEqual(['4', '9.5'])
    await form.evaluate((element: HTMLFormElement) => element.reset())
    await expect(start).toHaveValue('2')
    await expect(end).toHaveValue('8')
    await host.evaluate((element: RangeInput) => {
        const fieldset = document.createElement('fieldset')
        element.parentElement?.append(fieldset)
        fieldset.append(element)
        fieldset.disabled = true
    })
    await expect(start).toBeDisabled()
    await expect(end).toBeDisabled()
    expect(await read()).toEqual([])
})


test.describe('mobile range slider', () => {
    test.use({ viewport: { width: 320, height: 520 }, isMobile: true, hasTouch: true })
    test('double track responds to touch in dark mode without overflow', async ({ page }) => {
        await mount(page)
        await page.locator('#theme').evaluate(element => { element.setAttribute('appearance', 'dark') })
        const host = page.locator('cb-range-input')
        const rail = await host.locator('[part="range-rail"]').boundingBox()
        if (!rail) throw new Error('Track not rendered')
        expect(rail.x + rail.width).toBeLessThanOrEqual(320)
        await page.touchscreen.tap(rail.x + rail.width * 0.7, rail.y + rail.height / 2)
        await expect(host.getByRole('slider', { name: 'To', exact: true })).toHaveValue('7')
        await expect(host.getByRole('slider', { name: 'From', exact: true })).toHaveValue('2')
    })
})
