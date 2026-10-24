import { expect } from '@playwright/test'
import type { SegmentedControl } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-segmented-control', 'navigation--segmented-control', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release choice"}],"value":"release"} satisfies Partial<SegmentedControl>) })
    await expect(host.getByRole('radio', { name: 'Release choice', exact: true })).toHaveAttribute('aria-checked', 'true')
    await host.evaluate(node => { Object.assign(node, { iconOnly: true, items: [
        { id: 'left', label: 'Align left', icon: 'alignLeft' }, { id: 'right', label: 'Align right', icon: 'alignRight' },
    ], value: 'left' } satisfies Partial<SegmentedControl>) })
    const right = host.getByRole('radio', { name: 'Align right', exact: true })
    await expect(right).toHaveAttribute('data-icon-only', '')
    await expect(right.locator('[part~="button-label"]')).toHaveAttribute('part', /sr-only/)
    await right.click()
    await expect(right).toHaveAttribute('aria-checked', 'true')
    await right.press('ArrowLeft')
    const left = host.getByRole('radio', { name: 'Align left', exact: true })
    await expect(left).toBeFocused()
    await left.press('Space')
    await expect(left).toHaveAttribute('aria-checked', 'true')
    await host.evaluate(node => { Object.assign(node, { iconOnly: false } satisfies Partial<SegmentedControl>) })
    await expect(right.locator('[part~="button-label"]')).not.toHaveAttribute('part', /sr-only/)
})
