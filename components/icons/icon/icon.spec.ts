import { expect } from '@playwright/test'
import type { Icon } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'
import { iconPaths } from '../registry.js'

componentContract('cb-icon', 'icons--icon', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, { label: '', accessibleLabel: '' } satisfies Partial<Icon>) })
    await expect(host.locator("svg")).toHaveAttribute("aria-hidden", "true")
    await host.evaluate(node => { (node as Icon).name = 'ruler' })
    await expect(host.locator('svg path')).toHaveAttribute('d', iconPaths.ruler)
    for (const name of ['attributes', 'variant', 'cut', 'paste', 'trash', 'save', 'download', 'send', 'creditCard', 'filter', 'mailCheck', 'puzzle', 'shieldCheck', 'sidebarExpand', 'expandVertical', 'receipt', 'cartCheck', 'hexagon', 'microsoft', 'mail', 'inbox', 'collection', 'archive', 'workflow', 'wifiOff', 'apple', 'android', 'folder2-open', 'hourglass', 'people-fill', 'window-stack', 'bar-chart', 'palette', 'translate']) {
        await host.evaluate((node, name) => { (node as Icon).name = name }, name)
        await expect(host.locator('svg path')).toHaveAttribute('d', iconPaths[name])
    }
    await host.evaluate(node => { (node as Icon).name = 'trash' })
    await host.evaluate(node => { (node as Icon).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"/%3E' })
    await expect(host.locator('img')).toBeVisible()
    await expect(host.locator('svg')).toHaveCount(0)
    await host.evaluate(node => { (node as Icon).src = '' })
    await expect(host.locator('svg path')).toHaveAttribute('d', iconPaths.trash)
})
