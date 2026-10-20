import { expect } from '@playwright/test'
import type { ColorPicker } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-color-picker', 'styling--color-picker', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"#ff0000"} satisfies Partial<ColorPicker>) })
    await expect(host.locator("[part~=trigger-swatch]")).toHaveCSS("background-color", "rgb(255, 0, 0)")
})
