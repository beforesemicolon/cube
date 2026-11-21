import { expect } from '@playwright/test'
import type { Field } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-field', 'form--field', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"helpText":"Release help"} satisfies Partial<Field>) })
    await expect(host.locator("[part=help]")).toHaveText("Release help")
    await host.evaluate(node => {
        const input = document.createElement('cb-text-input')
        node.append(input)
    })
    const input = host.locator('cb-text-input')
    const [fieldWidth, controlWidth] = await host.evaluate(node => [
        node.getBoundingClientRect().width,
        node.querySelector('cb-text-input')?.getBoundingClientRect().width,
    ])
    expect(fieldWidth).toBeGreaterThan(320)
    expect(controlWidth).toBe(fieldWidth)
})
