import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const source = [
    "import { createClient } from '@beforesemicolon/api'",
    'const retries = 3',
    'const pattern = /^cube-[a-z]+$/i',
    'class Repository {',
    '  #cache = new Map()',
    '  async find(id) {',
    '    // Reuse fresh values when possible.',
    '    const cached = this.#cache.get(id)',
    '    if (cached?.ready) return cached.value',
    '    try {',
    '      return await createClient().get(`/projects/${id}`, { retries })',
    '    } catch (error) {',
    "      console.warn('Request failed', error)",
    '      throw error',
    '    }',
    '  }',
    '}',
].join('\n')

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-code-preview')))
    await page.evaluate(code => {
        const preview = document.createElement('cb-code-preview') as HTMLElement & {
            label: string
            code: string
            codeLanguage: string
            copyLabel: string
            copiedLabel: string
        }
        Object.assign(preview, {
            label: 'JavaScript repository example', code, codeLanguage: 'javascript',
            copyLabel: 'Copy JavaScript', copiedLabel: 'JavaScript copied',
        })
        document.querySelector('#fixture')?.append(preview)
    }, source)
}

test('highlights complex JavaScript syntax without executing it', async ({ page }) => {
    await start(page)
    const preview = page.locator('cb-code-preview')
    await expect(preview.locator('[part~=language]')).toHaveText('javascript')
    await expect(preview.locator('.hljs-keyword')).not.toHaveCount(0)
    await expect(preview.locator('.hljs-title')).not.toHaveCount(0)
    await expect(preview.locator('.hljs-string')).not.toHaveCount(0)
    await expect(preview.locator('.hljs-number')).not.toHaveCount(0)
    await expect(preview.locator('.hljs-regexp')).not.toHaveCount(0)
    await expect(preview.locator('.hljs-comment')).not.toHaveCount(0)
    await expect(preview.locator('[part~=code] script')).toHaveCount(0)
    await expect(preview.locator('[part~=pre]')).toHaveAttribute('tabindex', '0')
    await expect(preview.locator('[part~=pre]')).toHaveAttribute('role', 'region')
    await expect(preview.locator('[part~=pre]')).toHaveAttribute('aria-label', 'JavaScript repository example')
    await expect(preview.getByRole('button', { name: 'Copy JavaScript' })).toBeEnabled()
})

test('inherits distinct accessible syntax palettes in light and dark themes', async ({ page }) => {
    await start(page)
    const provider = page.locator('#theme')
    const preview = page.locator('cb-code-preview')
    const palette = async (): Promise<{ background: string; foreground: string; keyword: string; string: string; comment: string }> =>
        preview.evaluate(element => {
            const root = element.shadowRoot
            if (!root) throw new Error('Expected an open code preview shadow root')
            const pre = root.querySelector<HTMLElement>('[part~=pre]')
            const code = root.querySelector<HTMLElement>('[part~=code]')
            const keyword = root.querySelector<HTMLElement>('.hljs-keyword')
            const string = root.querySelector<HTMLElement>('.hljs-string')
            const comment = root.querySelector<HTMLElement>('.hljs-comment')
            if (!pre || !code || !keyword || !string || !comment) throw new Error('Expected highlighted JavaScript tokens')
            return {
                background: getComputedStyle(pre).backgroundColor,
                foreground: getComputedStyle(code).color,
                keyword: getComputedStyle(keyword).color,
                string: getComputedStyle(string).color,
                comment: getComputedStyle(comment).color,
            }
        })

    await provider.evaluate(element => { Reflect.set(element, 'appearance', 'light') })
    await expect(provider).toHaveCSS('color-scheme', 'light')
    const light = await palette()
    await provider.evaluate(element => { Reflect.set(element, 'appearance', 'dark') })
    await expect(provider).toHaveCSS('color-scheme', 'dark')
    const dark = await palette()

    expect(dark.background).not.toBe(light.background)
    expect(dark.foreground).not.toBe(light.foreground)
    expect(dark.keyword).not.toBe(light.keyword)
    expect(dark.string).not.toBe(light.string)
    expect(dark.comment).not.toBe(light.comment)
})

test('has no automatic accessibility violations in either theme', async ({ page }) => {
    await start(page)
    const provider = page.locator('#theme')
    for (const appearance of ['light', 'dark'] as const) {
        await provider.evaluate((element, mode) => { Reflect.set(element, 'appearance', mode) }, appearance)
        await expect(provider).toHaveCSS('color-scheme', appearance)
        const results = await new AxeBuilder({ page }).include('#fixture').analyze()
        expect(results.violations).toEqual([])
    }
})
