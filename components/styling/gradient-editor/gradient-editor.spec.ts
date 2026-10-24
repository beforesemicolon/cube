import { expect } from '@playwright/test'
import type { GradientEditor } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-gradient-editor', 'styling--gradient-editor', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"angle":45} satisfies Partial<GradientEditor>) })
    await expect(host.getByRole('spinbutton', { name: 'Angle', exact: true })).toHaveValue('45')
})
