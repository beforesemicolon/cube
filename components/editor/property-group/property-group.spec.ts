import { expect } from '@playwright/test'
import type { PropertyGroup } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-property-group', 'editor--property-group', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"mixed":true,"mixedLabel":"Release mixed"} satisfies Partial<PropertyGroup>) })
    await expect(host.getByText("Release mixed", { exact: true }).first()).toBeVisible()
    await host.evaluate(node => {
        const nested = document.createElement('cb-expandable-section')
        nested.setAttribute('label', 'Nested controls')
        const content = document.createElement('p'); content.textContent = 'Nested inspector controls'
        nested.append(content); node.append(nested)
    })
    await host.getByRole('button', { name: 'Nested controls', exact: true }).click()
    await expect(host.getByText('Nested inspector controls', { exact: true })).toBeVisible()
    await expect(host.locator('cb-expandable-section[part=section]')).toHaveAttribute('data-expanded', '')
})
