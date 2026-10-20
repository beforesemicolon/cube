import { expect } from '@playwright/test'
import type { Artboard } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-artboard', 'editor--artboard', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"width":420,"height":240,"showDimensions":true} satisfies Partial<Artboard>) })
    await expect(host.locator('[part=dimensions]')).toContainText('420')
})
