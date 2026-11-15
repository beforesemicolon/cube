import { expect } from '@playwright/test'
import type { Tabs } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-tabs', 'navigation--tabs', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release tab"}],"value":"release"} satisfies Partial<Tabs>) })
    await expect(host.getByRole('tab', { name: 'Release tab', exact: true })).toHaveAttribute('aria-selected', 'true')
    for (const stacked of [false, true]) {
        for (const icon of ['', 'file']) {
            await host.evaluate((node, { stacked, icon }) => {
                Object.assign(node, { stacked, items: [{ id: 'release', label: 'Release tab', description: 'Release details', icon }] } satisfies Partial<Tabs>)
            }, { stacked, icon })
            const tab = host.getByRole('tab', { name: 'Release tab', exact: true })
            await expect(tab.locator('[part=tab-description]')).toHaveText('Release details')
            await expect.poll(() => tab.evaluate(node => {
                const label = node.querySelector('[part=tab-label]')
                const description = node.querySelector('[part=tab-description]')
                if (!label || !description) return false
                return description.getBoundingClientRect().top >= label.getBoundingClientRect().bottom &&
                    Math.abs(description.getBoundingClientRect().left - label.getBoundingClientRect().left) < 1 &&
                    parseFloat(getComputedStyle(description).fontSize) < parseFloat(getComputedStyle(label).fontSize)
            })).toBe(true)
        }
    }
    await host.evaluate(node => {
        const panel = document.createElement('p')
        panel.slot = 'release'
        panel.textContent = 'Release panel content'
        node.append(panel)
    })
    await expect(host.getByText('Release panel content', { exact: true })).toBeVisible()
})
