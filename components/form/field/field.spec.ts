import { expect } from '@playwright/test'
import type { Field } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-field', 'form--field', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"helpText":"Release help"} satisfies Partial<Field>) })
    await expect(host.locator("[part=help]")).toHaveText("Release help")
})
