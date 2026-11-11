import { expect } from '@playwright/test'
import type { TextInput } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-text-input', 'form--text-input', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {
        value: 'Release text', type: 'email', autocomplete: 'email', pattern: '.+@.+',
        minLength: 3, maxLength: 80, inputMode: 'email', icon: 'search', width: '100%'
    } satisfies Partial<TextInput>) })
    await expect(host.locator("input:not([type=hidden])").first()).toHaveValue("Release text")
    const input = host.locator('input:not([type=hidden])').first()
    await expect(input).toHaveAttribute('type', 'email')
    await expect(input).toHaveAttribute('autocomplete', 'email')
    await expect(input).toHaveAttribute('pattern', '.+@.+')
    await expect(input).toHaveAttribute('minlength', '3')
    await expect(input).toHaveAttribute('maxlength', '80')
    await expect(input).toHaveAttribute('inputmode', 'email')
    await expect(host.locator('[part~="input-icon"]')).toBeVisible()
    const [hostWidth, parentWidth] = await host.evaluate(node => [
        node.getBoundingClientRect().width,
        node.parentElement?.getBoundingClientRect().width,
    ])
    expect(hostWidth).toBe(parentWidth)
})
