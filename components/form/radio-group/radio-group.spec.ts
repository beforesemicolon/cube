import { expect } from '@playwright/test'
import type { RadioGroup } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-radio-group', 'form--radio-group', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {
        options: [
            { value: 'draft', label: 'Draft option', description: 'Only editors can open it.' },
            { value: 'release', label: 'Release option', description: 'Everyone can open it.' },
        ],
        value: 'release',
    } satisfies Partial<RadioGroup>) })
    const selected = host.getByRole('radio', { name: 'Release option', exact: true })
    await expect(selected).toBeChecked()
    await expect(selected).toHaveAttribute('aria-description', 'Everyone can open it.')
    await expect(host.locator('[part~=option-description]')).toHaveText([
        'Only editors can open it.',
        'Everyone can open it.',
    ])

    await host.getByRole('radio', { name: 'Draft option', exact: true }).click()
    await expect(host).toHaveJSProperty('value', 'draft')
})
