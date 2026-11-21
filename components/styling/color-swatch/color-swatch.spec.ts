import { expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { ColorSwatch } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-color-swatch', 'styling--color-swatch', async ({ host, page }) => {
    await expect(host.getByRole('radio')).toHaveCount(7)
    await expect(host.getByRole('radio', { name: '#7c3aed', exact: true })).toHaveAttribute('aria-checked', 'true')
    await host.evaluate(node => {
        Object.assign(node, { options: [], label: 'Purple' } satisfies Partial<ColorSwatch>)
    })
    const button = host.getByRole('button', { name: 'Purple', exact: true })
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await host.evaluate(node => {
        Object.assign(node, { value: '#ff000080', selected: false, variant: 'round' } satisfies Partial<ColorSwatch>)
        node.setAttribute('data-action-count', '0')
        node.addEventListener('action', event => {
            const detail = (event as CustomEvent<{ value: string }>).detail
            node.setAttribute('data-action-value', detail.value)
            node.setAttribute('data-action-count', String(Number(node.getAttribute('data-action-count')) + 1))
        })
    })
    await expect(host.locator('[part="color"]')).toHaveCSS('background-color', 'rgba(255, 0, 0, 0.5)')
    await expect(host.locator('[part="preview"]')).toHaveCSS('border-radius', '50%')
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await button.press('Enter')
    await expect(host).toHaveAttribute('data-action-value', '#ff000080')
    await expect(host).toHaveAttribute('data-action-count', '1')
    await button.press('Space')
    await expect(host).toHaveAttribute('data-action-count', '2')
    await host.evaluate(node => node.setAttribute('selected', 'true'))
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    for (const [size, pixels] of [['tiny', 14], ['xs', 24], ['sm', 28], ['md', 36], ['lg', 44], ['xl', 52]] as const) {
        await host.evaluate((node, size) => node.setAttribute('size', size), size)
        await expect(host).toHaveCSS('width', `${pixels}px`)
    }
    await host.evaluate(node => {
        Object.assign(node, { disabled: true, variant: 'boxy' } satisfies Partial<ColorSwatch>)
    })
    await expect(button).toBeDisabled()
    await expect(host.locator('[part="preview"]')).not.toHaveCSS('border-radius', '50%')
    await button.press('Enter')
    await expect(host).toHaveAttribute('data-action-count', '2')
    await host.evaluate(node => {
        Object.assign(node, {
            value: '#ff0000', name: 'profileColor', disabled: false, size: 'sm', label: 'Profile color',
            options: [
                { value: '#f00', label: 'Red' },
                { value: '#0f0', label: 'Green', disabled: true },
                { value: '#00f', label: 'Blue' },
                '#ff0000', 'invalid',
            ],
        } satisfies Partial<ColorSwatch>)
        node.setAttribute('data-change-count', '0')
        node.addEventListener('change', event => {
            const detail = (event as CustomEvent<{ value: string; previousValue: string }>).detail
            node.setAttribute('data-change-count', String(Number(node.getAttribute('data-change-count')) + 1))
            node.setAttribute('data-change-value', detail.value)
            node.setAttribute('data-change-previous', detail.previousValue)
        })
    })
    const red = host.getByRole('radio', { name: 'Red', exact: true })
    const blue = host.getByRole('radio', { name: 'Blue', exact: true })
    await expect(host.getByRole('radiogroup', { name: 'Profile color' })).toBeVisible()
    await expect(host.getByRole('radio')).toHaveCount(3)
    await expect(red).toHaveAttribute('aria-checked', 'true')
    await blue.click()
    await expect(host).toHaveAttribute('data-change-count', '1')
    await expect(host).toHaveAttribute('data-change-value', '#0000ff')
    await expect(host).toHaveAttribute('data-change-previous', '#ff0000')
    await blue.click()
    await expect(host).toHaveAttribute('data-change-count', '1')
    await blue.press('Home')
    await expect(red).toHaveAttribute('aria-checked', 'true')
    await red.press('ArrowRight')
    await expect(blue).toBeFocused()
    await expect(blue).toHaveAttribute('aria-checked', 'true')
    await expect(host).toHaveAttribute('data-action-count', '2')
    await host.evaluate(node => node.addEventListener('beforechange', event => event.preventDefault(), { once: true }))
    await blue.press('Home')
    await expect(host).toHaveJSProperty('value', '#0000ff')
    expect((await new AxeBuilder({ page }).include('cb-color-swatch').analyze()).violations).toEqual([])
    await host.evaluate(node => {
        const form = document.createElement('form')
        node.parentElement?.append(form)
        form.append(node)
    })
    await expect.poll(() => host.evaluate(node => {
        const form = node.closest('form')
        return form ? new FormData(form).get('profileColor') : null
    })).toBe('#0000ff')
    await host.evaluate(node => node.closest('form')?.reset())
    await expect(host).toHaveJSProperty('value', '#7c3aed')
    await host.evaluate(node => {
        const form = node.closest('form')
        if (!form) throw new Error('Expected a form')
        const fieldset = document.createElement('fieldset')
        fieldset.disabled = true
        form.append(fieldset)
        fieldset.append(node)
    })
    await expect(blue).toBeDisabled()
    await expect.poll(() => host.evaluate(node => {
        const form = node.closest('form')
        return form ? new FormData(form).has('profileColor') : true
    })).toBe(false)
})
