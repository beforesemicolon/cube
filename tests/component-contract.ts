import { expect, test, type Locator, type Page } from '@playwright/test'

interface ContractContext { readonly page: Page; readonly host: Locator }
interface RenderError { readonly code?: string; readonly component?: string; readonly error?: Error }
declare global { interface Window { releaseRenderErrors: string[] } }

/** Each colocated spec supplies its own public behavior assertion. */
export function componentContract(tag: string, story: string, verify: (context: ContractContext) => Promise<void>): void {
    test(`${tag}: standalone stylesheet and public behavior`, async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', error => errors.push(error.message))
        await page.addInitScript(() => {
            const target = window
            target.releaseRenderErrors = []
            document.addEventListener('error', event => {
                if (!(event instanceof CustomEvent)) return
                const detail = (event as CustomEvent<RenderError>).detail
                if (detail?.code === 'COMPONENT_ERROR') target.releaseRenderErrors.push(`${detail.component}: ${detail.error?.message}`)
            }, true)
        })
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=${story}&viewMode=story`)
        const host = page.locator(`${tag}[data-story-component]`)
        // Cold Storybook imports must finish before component assertions begin.
        await expect(host).toHaveCount(1, { timeout: 20_000 })
        await expect.poll(() => host.evaluate(node => node.shadowRoot?.adoptedStyleSheets.length ?? 0)).toBeGreaterThan(0)
        await verify({ page, host })
        expect(errors).toEqual([])
        expect(await page.evaluate(() => window.releaseRenderErrors)).toEqual([])
    })
}
