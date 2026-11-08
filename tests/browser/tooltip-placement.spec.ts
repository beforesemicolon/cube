import { expect, test, type Locator } from '@playwright/test'
import type { Tooltip, TooltipPlacement } from '../../components/overlay/tooltip/index.js'

const contained = async (hint: Locator): Promise<void> => {
    await expect.poll(async () => {
        const rect = await hint.boundingBox(), viewport = hint.page().viewportSize()!
        return !!rect && rect.x >= 7.9 && rect.y >= 7.9 && rect.x + rect.width <= viewport.width - 7.9 && rect.y + rect.height <= viewport.height - 7.9
    }).toBe(true)
}

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-tooltip')))
})

test('every ordinary tooltip placement is a preference and flips at viewport edges', async ({ page }) => {
    await page.evaluate(() => {
        const host = document.createElement('cb-tooltip') as Tooltip
        host.id = 'edge-tooltip'
        Object.assign(host, { content: 'A readable edge tooltip', delay: 0, open: true } satisfies Partial<Tooltip>)
        const button = document.createElement('button')
        button.textContent = 'Edge trigger'
        host.append(button)
        document.getElementById('fixture')!.append(host)
    })
    const host = page.locator('#edge-tooltip'), hint = host.getByRole('tooltip'), button = host.getByRole('button')
    const placements: readonly TooltipPlacement[] = ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'right']
    for (const placement of placements) {
        await host.evaluate((node, placement) => {
            const tooltip = node as Tooltip
            tooltip.placement = placement
            tooltip.style.cssText = `position:fixed;${placement.startsWith('bottom') ? 'bottom:2px' : 'top:2px'};${placement === 'right' || placement.endsWith('-end') ? 'right:2px' : 'left:2px'}`
        }, placement)
        await expect(hint).toBeVisible()
        await expect.poll(() => hint.evaluate(node => node.matches(':popover-open'))).toBe(true)
        await contained(hint)
        await expect.poll(async () => {
            const bubble = (await hint.boundingBox())!, trigger = (await button.boundingBox())!
            return placement.startsWith('top') ? bubble.y >= trigger.y + trigger.height + 5
                : placement.startsWith('bottom') ? bubble.y + bubble.height <= trigger.y - 5
                    : placement === 'left' ? bubble.x >= trigger.x + trigger.width + 5 : bubble.x + bubble.width <= trigger.x - 5
        }).toBe(true)
    }
    await page.setViewportSize({ width: 320, height: 180 })
    await host.evaluate(node => { (node as Tooltip).content = 'A very long tooltip with readable content near the viewport edge '.repeat(8) })
    await contained(hint)
    await expect.poll(() => hint.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
})

test('ordinary tooltips escape transformed nested scrollports and follow focus until the trigger leaves view', async ({ page }) => {
    await page.evaluate(() => {
        const outer = document.createElement('div')
        outer.style.cssText = 'position:fixed;left:8px;top:0;width:180px;height:48px;overflow:auto;transform:scale(.8);transform-origin:top left;isolation:isolate'
        const shadowHost = document.createElement('div'), shadow = shadowHost.attachShadow({ mode: 'open' })
        const inner = document.createElement('div')
        inner.id = 'nested-scroll'
        inner.style.cssText = 'height:44px;overflow:auto'
        const content = document.createElement('div')
        content.style.height = '400px'
        const tooltip = document.createElement('cb-tooltip') as Tooltip
        Object.assign(tooltip, { content: 'This complete tooltip escapes the tiny toolbar', placement: 'top', delay: 0 } satisfies Partial<Tooltip>)
        const button = document.createElement('button')
        button.textContent = 'Scroll trigger'
        button.style.height = '36px'
        tooltip.append(button); content.append(tooltip); inner.append(content); shadow.append(inner); outer.append(shadowHost)
        document.getElementById('fixture')!.append(outer)
    })
    const button = page.getByRole('button', { name: 'Scroll trigger', exact: true }), hint = page.getByRole('tooltip'), scroller = page.locator('#nested-scroll')
    await button.focus()
    await expect(hint).toBeVisible()
    await contained(hint)
    expect(await hint.evaluate(node => node.matches(':popover-open'))).toBe(true)
    await expect.poll(() => hint.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true)
    const initial = (await hint.boundingBox())!
    await scroller.evaluate(node => { node.scrollTop = 10 })
    await expect(hint).toBeVisible()
    await expect.poll(async () => (await hint.boundingBox())!.y).toBeLessThan(initial.y)
    await scroller.evaluate(node => { node.scrollTop = 150 })
    await expect(hint).toBeHidden()
    await scroller.evaluate(node => { node.scrollTop = 0 })
    await expect(hint).toBeVisible()
    await button.blur()
    await expect(hint).toBeHidden()
    await button.focus()
    await expect(hint).toBeVisible()
    await page.locator('cb-tooltip').evaluate(node => node.remove())
    await expect(page.getByRole('tooltip')).toHaveCount(0)
})
