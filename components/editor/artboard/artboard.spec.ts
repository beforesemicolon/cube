import { expect } from '@playwright/test'
import type { Artboard } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-artboard', 'editor--artboard', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"width":420,"height":240,"showDimensions":true} satisfies Partial<Artboard>) })
    await expect(host.locator('[part=dimensions]')).toContainText('420')
    await host.getByRole('button', { name: /^Artboard name/ }).dblclick()
    await host.getByRole('textbox', { name: 'Artboard name', exact: true }).fill('Landing page')
    await host.getByRole('button', { name: 'Save name', exact: true }).click()
    await expect(host).toHaveJSProperty('name', 'Landing page')
    await host.getByRole('button', { name: 'Resize right', exact: true }).press('ArrowRight')
    await expect(host).toHaveJSProperty('width', 421)
})
