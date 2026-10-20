import { expect } from '@playwright/test'
import type { RadioGroup } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-radio-group', 'form--radio-group', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { options: [{ value: 'release', label: 'Release option' }], value: 'release' } satisfies Partial<RadioGroup>) })
    await expect(host.getByRole('radio', { name: 'Release option', exact: true })).toBeChecked()
})
