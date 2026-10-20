import { expect } from '@playwright/test'
import type { SelectionOverlay } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-selection-overlay', 'editor--selection-overlay', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"rect":{"x":20,"y":30,"width":140,"height":90}} satisfies Partial<SelectionOverlay>) })
    await expect(host).toHaveCSS("width", "140px")
})
