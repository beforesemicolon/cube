import { expect, test } from '@playwright/test'

test('published ESM categories initialize with imported shadow stylesheets', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/esm-styles-fixture', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><title>Module consumer</title></head><body></body></html>' }))
    await page.goto('/esm-styles-fixture')
    await page.evaluate(async () => {
        const categoryPath = '/dist/esm/data-display/index.js'
        const { List, Avatar }: typeof import('../../components/data-display/index.js') = await import(categoryPath)
        const list = new List<string>()
        list.items = ['One', 'Two']
        list.gap = 12
        list.style.height = '40px'
        list.renderItem = item => { const row = document.createElement('div'); row.textContent = item; row.style.height = '30px'; return row }
        const avatar = new Avatar()
        avatar.name = 'Release User'
        document.body.append(list, avatar)
    })
    const list = page.locator('cb-list')
    await expect(list.locator('[part=item]')).toHaveCount(2)
    await expect(list.locator('[part=items]')).toHaveCSS('gap', '12px')
    await expect(list).toHaveCSS('overflow-y', 'auto')
    await expect.poll(() => list.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true)
    await expect(page.locator('cb-avatar [part~=initials]')).toHaveAttribute('data-initials', 'RU')
    await expect.poll(() => page.locator('cb-avatar').evaluate(node => node.shadowRoot?.adoptedStyleSheets.length ?? 0)).toBeGreaterThan(0)
    expect(errors).toEqual([])
})
