import { expect, test } from '@playwright/test'

test('heading renders semantic text and shortcut remains a text component', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-heading')))
    await page.evaluate(() => {
        const heading = document.createElement('cb-heading') as HTMLElement & { label: string; description: string; variant: string }
        Object.assign(heading, { label: 'Design system', description: 'Shared components', variant: 'h3' })
        const shortcut = document.createElement('cb-shortcut') as HTMLElement & { keys: string; accessibleLabel: string }
        Object.assign(shortcut, { keys: '⌘+K', accessibleLabel: 'Command K' })
        document.querySelector('#fixture')?.append(heading, shortcut)
    })
    await expect(page.getByRole('heading', { level: 3, name: 'Design system' })).toBeVisible()
    await expect(page.getByText('Shared components')).toBeVisible()
    await expect(page.getByLabel('Command K')).toBeVisible()
})
