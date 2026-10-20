import { expect } from '@playwright/test'
import type { FilePicker } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-file-picker', 'form--file-picker', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { multiple: true } satisfies Partial<FilePicker>) })
    await expect(host.locator('input[type=file]')).toHaveJSProperty('multiple', true)
})
