import { expect } from '@playwright/test'
import type { MarqueeSelection } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-marquee-selection', 'editor--marquee-selection', async ({ host }) => {
    const result = await host.evaluate(node => {
        const control = node as HTMLElement & {
            begin(point: { x: number; y: number }): boolean
            updateSelection(point: { x: number; y: number }): void
            finish(): readonly string[]
        }
        Object.assign(node, { targets: [{ id: 'release', rect: { x: 20, y: 20, width: 30, height: 30 } }] } satisfies Partial<MarqueeSelection>)
        control.begin({ x: 10, y: 10 }); control.updateSelection({ x: 80, y: 80 })
        return control.finish()
    })
    expect(result).toEqual(['release'])
})
