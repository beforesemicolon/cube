import { expect } from '@playwright/test'
import type { Tabs } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-tabs', 'navigation--tabs', async ({ host }) => {
    await host.evaluate((node) => {
        Object.assign(node, {
            items: [{ id: 'release', label: 'Release tab' }],
            value: 'release',
        } satisfies Partial<Tabs>)
    })
    await expect(
        host.getByRole('tab', { name: 'Release tab', exact: true })
    ).toHaveAttribute('aria-selected', 'true')
    for (const stacked of [false, true]) {
        for (const icon of ['', 'file']) {
            await host.evaluate(
                (node, { stacked, icon }) => {
                    Object.assign(node, {
                        stacked,
                        items: [
                            {
                                id: 'release',
                                label: 'Release tab',
                                description: 'Release details',
                                icon,
                            },
                        ],
                    } satisfies Partial<Tabs>)
                },
                { stacked, icon }
            )
            const tab = host.getByRole('tab', {
                name: 'Release tab',
                exact: true,
            })
            await expect(tab.locator('[part=tab-description]')).toHaveText(
                'Release details'
            )
            await expect
                .poll(() =>
                    tab.evaluate((node) => {
                        const label = node.querySelector('[part=tab-label]')
                        const description = node.querySelector(
                            '[part=tab-description]'
                        )
                        if (!label || !description) return false
                        return (
                            description.getBoundingClientRect().top >=
                                label.getBoundingClientRect().bottom &&
                            Math.abs(
                                description.getBoundingClientRect().left -
                                    label.getBoundingClientRect().left
                            ) < 1 &&
                            parseFloat(getComputedStyle(description).fontSize) <
                                parseFloat(getComputedStyle(label).fontSize)
                        )
                    })
                )
                .toBe(true)
        }
    }
    await host.evaluate((node) => {
        const panel = document.createElement('p')
        panel.slot = 'release'
        panel.textContent = 'Release panel content'
        node.append(panel)
    })
    await expect(
        host.getByText('Release panel content', { exact: true })
    ).toBeVisible()
    await expect
        .poll(() =>
            host.evaluate((node) => {
                const tablist = (node as Tabs).contentRoot?.querySelector('[part=tablist]')
                const panel = (node as Tabs).contentRoot?.querySelector('[part=tabpanel]')
                if (!tablist || !panel) return 0
                return Math.round(
                    panel.getBoundingClientRect().top -
                        tablist.getBoundingClientRect().bottom
                )
            })
        )
        .toBe(16)
    await host.evaluate(node => {
        node.style.inlineSize = '960px'
        Object.assign(node, { stacked: false, fill: false, items: [
            { id: 'release', label: 'Release', description: 'A longer description determines this tab width' },
            { id: 'preview', label: 'Preview', description: 'Short' },
        ] } satisfies Partial<Tabs>)
    })
    const widths = () => host.locator('[part=tab-item]').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().width))
    await expect.poll(async () => { const [first = 0, second = 0] = await widths(); return first > second }).toBe(true)
    await expect(host.locator('[part=tab]').first()).toHaveCSS('padding-inline-end', '30px')
    await expect(host.locator('[part=tab-description]').first()).toHaveCSS('white-space', 'nowrap')
    await host.evaluate(node => { (node as Tabs).fill = true })
    await expect.poll(async () => { const [first = 0, second = 0] = await widths(); return Math.abs(first - second) < 1 }).toBe(true)
    await expect.poll(() => host.locator('[part=tablist]').evaluate(node => {
        const total = [...node.children].reduce((sum, child) => sum + child.getBoundingClientRect().width, 0)
        return Math.abs(total + parseFloat(getComputedStyle(node).columnGap) - node.clientWidth) < 1
    })).toBe(true)
    await host.evaluate(node => { node.style.inlineSize = '240px' })
    await expect.poll(() => host.locator('[part=tablist]').evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true)
})
