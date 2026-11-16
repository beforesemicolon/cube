import { expect } from '@playwright/test'
import type { Divider } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-divider', 'layout--divider', async ({ host }) => {
    await expect(host).toHaveAttribute('data-size', 'md')
    await expect(host).toHaveCSS('height', '2px')
    for (const stacked of [false, true]) {
        await host.evaluate((node, stacked) => { Object.assign(node, { stacked } satisfies Partial<Divider>) }, stacked)
        for (const [size, thickness] of [['tiny', 1], ['xs', 1], ['sm', 1], ['md', 2], ['lg', 3], ['xl', 4]] as const) {
            await host.evaluate((node, size) => node.setAttribute('size', size), size)
            await expect(host).toHaveCSS(stacked ? 'width' : 'height', `${thickness}px`)
        }
        await host.evaluate(node => node.style.setProperty('--component-divider-thickness', '5px'))
        await expect(host).toHaveCSS(stacked ? 'width' : 'height', '5px')
        await host.evaluate(node => node.style.removeProperty('--component-divider-thickness'))
    }
    await host.evaluate(node => { Object.assign(node, { stacked: false, size: 'md', label: 'Sections' } satisfies Partial<Divider>) })
    const label = host.locator('[part=label]')
    const before = host.locator('[part~=before]')
    const after = host.locator('[part~=after]')
    await expect(label).toHaveText('Sections')
    await expect(host).toHaveAttribute('aria-label', 'Sections')
    for (const stacked of [false, true]) {
        await host.evaluate((node, stacked) => {
            Object.assign(node, { stacked } satisfies Partial<Divider>)
            node.style.height = stacked ? '160px' : ''
        }, stacked)
        for (const position of ['start', 'center', 'end'] as const) {
            await host.evaluate((node, position) => node.setAttribute('label-position', position), position)
            await expect(before).toHaveCSS('display', position === 'start' ? 'none' : 'block')
            await expect(after).toHaveCSS('display', position === 'end' ? 'none' : 'block')
            await expect.poll(() => host.evaluate((node, { stacked, position }) => {
                const content = node.shadowRoot?.querySelector('[part=divider]')?.getBoundingClientRect()
                const text = node.shadowRoot?.querySelector('[part=label]')?.getBoundingClientRect()
                if (!content || !text) return false
                const start = stacked ? 'top' : 'left'
                const end = stacked ? 'bottom' : 'right'
                return Math.abs(position === 'center'
                    ? (text[start] + text[end] - content[start] - content[end]) / 2
                    : text[position === 'start' ? start : end] - content[position === 'start' ? start : end]) < 1
            }, { stacked, position })).toBe(true)
        }
        for (const variant of ['solid', 'dotted', 'dashed', 'double'] as const) {
            await host.evaluate((node, variant) => node.setAttribute('variant', variant), variant)
            await expect(before).toHaveCSS(stacked ? 'border-left-style' : 'border-top-style', variant)
            await expect(before).toHaveCSS(stacked ? 'border-left-width' : 'border-top-width', variant === 'double' ? '3px' : '2px')
        }
    }
    await host.evaluate(node => { Object.assign(node, { stacked: false, label: '', variant: 'solid' } satisfies Partial<Divider>); node.style.height = '' })
    await expect(label).toHaveCount(0)
    await expect(host).not.toHaveAttribute('aria-label')
    await expect(host).toHaveCSS('height', '2px')
})
