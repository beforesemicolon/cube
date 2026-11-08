import { expect, test } from '@playwright/test'
import type { Button } from '../../components/action/button/index.js'
import type { SegmentedControl } from '../../components/navigation/segmented-control/index.js'

test('button and semantic segmented labels stay on one line unless wrap is enabled', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-segmented-control')))
    await page.evaluate(() => {
        const fixture = document.querySelector('#fixture')!
        const button = document.createElement('cb-button') as Button
        Object.assign(button, { label: 'A longer button label', size: 'sm' } satisfies Partial<Button>)
        button.style.width = '100px'
        const segment = document.createElement('cb-segmented-control') as SegmentedControl
        Object.assign(segment, { items: [{ id: 'crop', label: 'Crop' }, { id: 'shrink', label: 'Shrink only' }], value: 'crop', size: 'sm' } satisfies Partial<SegmentedControl>)
        segment.style.width = '150px'
        fixture.append(button, segment)
    })
    const button = page.locator('#fixture > cb-button'), segment = page.locator('cb-segmented-control')
    const label = button.locator('[part~=label]'), choice = segment.getByRole('radio', { name: 'Shrink only', exact: true })
    const semanticLabel = choice.locator('[part~=button-label]')
    await expect(label).toHaveCSS('white-space', 'nowrap')
    await expect(semanticLabel).toHaveCSS('white-space', 'nowrap')
    const singleLineHeight = (await label.boundingBox())!.height
    await button.evaluate(node => node.setAttribute('wrap', 'true'))
    await expect(label).toHaveCSS('white-space', 'normal')
    await expect.poll(async () => (await label.boundingBox())!.height).toBeGreaterThan(singleLineHeight)
    await choice.evaluate(node => node.setAttribute('wrap', 'true'))
    await expect(semanticLabel).toHaveCSS('white-space', 'normal')
    await button.evaluate(node => node.setAttribute('wrap', 'false'))
    await choice.evaluate(node => node.removeAttribute('wrap'))
    await expect(label).toHaveCSS('white-space', 'nowrap')
    await expect(semanticLabel).toHaveCSS('white-space', 'nowrap')
    await expect(choice).toHaveAttribute('aria-checked', 'false')
    await choice.click()
    await expect(choice).toHaveAttribute('aria-checked', 'true')
})
