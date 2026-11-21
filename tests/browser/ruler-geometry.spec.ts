import { expect, test } from '@playwright/test'
import type { Rulers } from '../../components/editor/rulers/index.js'

for (const appearance of ['light', 'dark']) {
    test(`ruler labels stay aligned and readable across zoom and pan in ${appearance}`, async ({ page }) => {
        await page.goto('/tests/browser/fixture.html')
        await page.waitForFunction(() => Boolean(customElements.get('cb-rulers')))
        await page.evaluate((theme) => {
            document.querySelector('#theme')?.setAttribute('appearance', theme)
            const rulers = document.createElement('cb-rulers') as Rulers
            rulers.accessibleLabel = 'Ruler geometry'
            rulers.showCursor = false
            document.querySelector('#fixture')?.append(rulers)
        }, appearance)
        const ruler = page.locator('cb-rulers')
        for (const view of [
            { zoom: 100, originX: 0, originY: 0 },
            { zoom: 10, originX: -850, originY: -450 },
            { zoom: 100, originX: -120, originY: -80 },
            { zoom: 60, originX: 140, originY: 220 },
            { zoom: 200, originX: 60, originY: -180 },
            { zoom: 100, originX: 0, originY: 0 },
        ]) {
            await ruler.evaluate((node, props) => Object.assign(node as Rulers, props), view)
            await expect.poll(async () => ruler.evaluate((node, props) => {
                const root = (node as Rulers).contentRoot
                return ['horizontal', 'vertical'].every((axis) => {
                    const strip = root.querySelector<HTMLElement>(`[part~="${axis}"]`)
                    if (!strip) return false
                    const origin = axis === 'horizontal' ? props.originX : props.originY
                    const labels = Array.from(strip.querySelectorAll<HTMLElement>('[part~="tick-label"]'))
                    const positions = labels.map((label) => {
                        const position = parseFloat(axis === 'horizontal' ? label.style.insetInlineStart : label.style.insetBlockStart)
                        const expected = (parseFloat(label.textContent || '') - origin) * props.zoom / 100
                        return { position, expected }
                    })
                    return positions.length > 2 && positions.every(({ position, expected }, index) =>
                        Math.abs(position - expected) < 0.01 &&
                        (index === 0 || position - positions[index - 1]!.position >= 79.9)
                    )
                })
            }, view)).toBe(true)
        }
    })
}
