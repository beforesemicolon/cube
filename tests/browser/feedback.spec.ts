import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-skeleton')))
}

test('skeleton renders visible text, card and table placeholders', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const skeleton = document.createElement('cb-skeleton') as HTMLElement & {
            variant: 'text' | 'card' | 'table'
            lines: number
            rows: number
            columns: number
            animated: boolean
            accessibleLabel: string
        }
        Object.assign(skeleton, { variant: 'text', lines: 4, rows: 2, columns: 3, animated: true, accessibleLabel: 'Loading content' })
        document.querySelector('#fixture')?.append(skeleton)
    })
    const skeleton = page.locator('cb-skeleton')
    await expect(skeleton.locator('[part~=line]')).toHaveCount(4)
    await expect(skeleton.locator('[part~=line]').first()).toHaveCSS('width', /\d+px/)
    await expect(skeleton.getByRole('status', { name: 'Loading content' })).toBeVisible()

    await skeleton.evaluate((node: HTMLElement & { variant: 'card'; lines: number }) => { node.variant = 'card'; node.lines = 2 })
    await expect(skeleton.locator('[part~=media]')).toBeVisible()
    await expect(skeleton.locator('[part~=card-content] [part~=line]')).toHaveCount(2)

    await skeleton.evaluate((node: HTMLElement & { variant: 'table'; rows: number; columns: number }) => { node.variant = 'table'; node.rows = 2; node.columns = 3 })
    await expect(skeleton.locator('[part~=row]')).toHaveCount(2)
    await expect(skeleton.locator('[part~=cell]')).toHaveCount(6)
    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})
