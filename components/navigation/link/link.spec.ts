import { expect, test } from '@playwright/test'
import type { Link } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-link', 'navigation--link', async ({ host, page }) => {
    await host.evaluate(node => { Object.assign(node, {"href":"#release-target"} satisfies Partial<Link>) })
    await expect(host.locator("a")).toHaveAttribute("href", "#release-target")
    await host.evaluate(node => {
        node.style.setProperty('--color-foreground', 'rgb(30, 30, 30)')
        node.style.setProperty('--color-signal-text', 'rgb(20, 70, 160)')
        node.style.setProperty('--color-primary-hover', 'rgb(10, 40, 100)')
        node.style.setProperty('--color-danger', 'rgb(180, 30, 50)')
        node.style.setProperty('--color-danger-hover', 'rgb(140, 20, 40)')
        node.style.setProperty('--color-muted-foreground', 'rgb(100, 100, 100)')
    })
    const variants = [
        ['ghost', 'rgb(30, 30, 30)', 'rgb(20, 70, 160)', 'none'],
        ['primary', 'rgb(20, 70, 160)', 'rgb(10, 40, 100)', 'underline'],
        ['destructive', 'rgb(180, 30, 50)', 'rgb(140, 20, 40)', 'underline'],
        ['secondary', 'rgb(20, 70, 160)', 'rgb(10, 40, 100)', 'none'],
        ['outline', 'rgb(100, 100, 100)', 'rgb(30, 30, 30)', 'underline'],
    ] as const
    const anchor = host.locator('a')
    await host.evaluate(node => {
        if (node.parentElement) node.parentElement.style.fontSize = '16px'
    })
    await expect(anchor).toHaveCSS('font-size', '16px')
    for (const [size, pixels] of [
        ['tiny', 10], ['xs', 12], ['sm', 16], ['md', 18], ['lg', 20], ['xl', 24],
    ] as const) {
        await host.evaluate((node, size) => node.setAttribute('size', size), size)
        await expect(anchor).toHaveCSS('font-size', `${pixels}px`)
    }
    await host.evaluate(node => {
        Object.assign(node, { size: 'sm' } satisfies Partial<Link>)
        if (node.parentElement) node.parentElement.style.fontSize = '20px'
    })
    await expect(anchor).toHaveCSS('font-size', '20px')
    for (const [variant, color, hoverColor, decoration] of variants) {
        await page.mouse.move(0, 0)
        await host.evaluate((node, variant) => {
            Object.assign(node, { variant } satisfies Partial<Link>)
        }, variant)
        await expect(host).toHaveAttribute('data-variant', variant)
        await expect(anchor).toHaveCSS('color', color)
        await expect(anchor).toHaveCSS('text-decoration-line', decoration)
        await expect(anchor).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
        await anchor.hover()
        await expect(anchor).toHaveCSS('color', hoverColor)
        await expect(anchor).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    }
    await host.evaluate(node => {
        Object.assign(node, { variant: 'ghost', disabled: true } satisfies Partial<Link>)
    })
    await expect(anchor).toHaveAttribute('aria-disabled', 'true')
    await expect(anchor).toHaveCSS('color', 'rgb(30, 30, 30)')
})

test('links inherit paragraph typography and wrap as inline text', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--inline-links&viewMode=story')
    const paragraph = page.locator('[data-inline-link-paragraph]')
    const link = paragraph.locator('cb-link').first()
    const anchor = link.locator('a')
    await expect(link).toHaveCSS('display', 'inline')
    await expect(anchor).toHaveCSS('display', 'inline')
    await expect(anchor).toHaveCSS('min-height', '0px')
    for (const property of ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing']) {
        const inherited = await paragraph.evaluate((node, property) => getComputedStyle(node).getPropertyValue(property), property)
        await expect(anchor).toHaveCSS(property, inherited)
    }
    const wrapping = page.locator('[data-wrapping-link] a')
    await expect.poll(() => wrapping.evaluate(node => node.getClientRects().length)).toBeGreaterThan(1)
    await link.evaluate(node => { (node as Link).size = 'lg' })
    await expect(anchor).toHaveCSS('font-size', '20px')
    await expect(anchor).toHaveCSS('line-height', '28px')
    await link.evaluate(node => node.style.setProperty('--component-link-font-size', '18px'))
    await expect(anchor).toHaveCSS('font-size', '18px')
})
