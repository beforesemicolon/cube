import { expect, test } from '@playwright/test'
import type { RangeSlider } from '../../components/form/range-slider/index.js'
import type { Slider } from '../../components/form/slider/index.js'

test('published sliders keep their distinct scalar behavior without a second public story', async ({
    page,
}) => {
    await page.goto('/tests/browser/fixture.html')
    await page.evaluate(async () => {
        await Promise.all([
            customElements.whenDefined('cb-slider'),
            customElements.whenDefined('cb-range-slider'),
        ])
        const form = document.createElement('form')
        form.innerHTML = `
            <cb-slider name="volume" accessible-label="Volume" value-text="Half volume"
                stacked min="0" max="1" step="any" value="0.5"></cb-slider>
            <cb-range-slider name="opacity" accessible-label="Opacity"
                min="0" max="100" step="5" value="40"></cb-range-slider>`
        document.querySelector('#fixture')?.append(form)
    })
    const slider = page.locator('cb-slider')
    const volume = slider.getByRole('slider', { name: 'Volume' })
    const range = page.locator('cb-range-slider')
    const opacity = range.getByRole('slider', { name: 'Opacity' })
    await expect(volume).toHaveAttribute('aria-orientation', 'vertical')
    await expect(volume).toHaveAttribute('aria-valuetext', 'Half volume')
    await expect(volume).toHaveAttribute('step', 'any')
    await slider.evaluate((node: Slider) => node.setValue(0.625))
    await expect(volume).toHaveValue('0.625')

    expect(await range.evaluate((node: RangeSlider) => node.componentName)).toBe('range-slider')
    await opacity.focus()
    await opacity.press('ArrowRight')
    await expect(opacity).toHaveValue('45')
    const form = page.locator('form')
    expect(await form.evaluate((node: HTMLFormElement) => Object.fromEntries(new FormData(node)))).toEqual({
        volume: '0.625',
        opacity: '45',
    })
    await form.evaluate((node: HTMLFormElement) => node.reset())
    await expect(volume).toHaveValue('0.5')
    await expect(opacity).toHaveValue('40')
})
