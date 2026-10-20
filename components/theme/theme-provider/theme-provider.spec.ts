import { expect } from '@playwright/test'
import type { ThemeProvider } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-theme-provider', 'theme--theme-provider', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"appearance":"dark"} satisfies Partial<ThemeProvider>) })
    await expect(host).toHaveCSS("color-scheme", "dark")
})
