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
    const description = page.getByText('Shared components')
    await expect(description).toBeVisible()
    const descriptionStyle = await description.evaluate(element => {
        const style = getComputedStyle(element)
        return { fontSize: style.fontSize, marginBlockStart: style.marginBlockStart, marginBlockEnd: style.marginBlockEnd }
    })
    expect(descriptionStyle).toEqual({ fontSize: '14px', marginBlockStart: '0px', marginBlockEnd: '0px' })
    await expect(page.getByLabel('Command K')).toBeVisible()
})
