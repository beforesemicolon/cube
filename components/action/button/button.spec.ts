import { expect } from '@playwright/test'
import type { Button } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-button', 'action--button', async ({ page, host }) => {
    await expect(host).toHaveAttribute('data-size', 'md')
    await host.evaluate(node => {
        const button = document.createElement('cb-button')
        button.textContent = 'Default size'
        node.after(button)
    })
    await expect(page.getByRole('button', { name: 'Default size', exact: true })).toHaveCSS('font-size', '14px')
    await host.evaluate(node => { Object.assign(node, { label: 'Button', icon: 'plus', variant: 'primary' } satisfies Partial<Button>) })
    const textColor = await host.locator('[part~=label]').evaluate(node => getComputedStyle(node).color)
    await expect(host.locator('cb-icon')).toHaveCSS('color', textColor)
    await expect(host.locator('cb-icon svg path')).toHaveCSS('stroke', textColor)
    for (const [size, fontSize] of [
        ['tiny', 10], ['xs', 11], ['sm', 12], ['md', 14], ['lg', 16], ['xl', 18],
    ] as const) {
        await host.evaluate((node, size) => node.setAttribute('size', size), size)
        await expect(host.getByRole('button', { name: 'Button', exact: true })).toHaveCSS('font-size', `${fontSize}px`)
    }
    await host.evaluate(node => {
        node.style.setProperty('--component-font-size', '18px')
        node.setAttribute('size', 'lg')
    })
    await expect(host.getByRole('button', { name: 'Button', exact: true })).toHaveCSS('font-size', '24px')
    await host.evaluate(node => {
        node.style.removeProperty('--component-font-size')
    })
    await host.evaluate(node => { Object.assign(node, { size: 'tiny', icon: 'close', iconOnly: true, accessibleLabel: 'Close', variant: 'ghost', pressed: false } satisfies Partial<Button>) })
    const tiny = host.getByRole('button', { name: 'Close', exact: true })
    await expect(tiny).toHaveCSS('padding', '1px')
    await expect(tiny).toHaveCSS('height', '14px')
    await expect(host.locator('cb-icon')).toHaveCSS('font-size', '10px')
    await tiny.click()
    await expect(tiny).toHaveAttribute('aria-pressed', 'true')
    await host.evaluate(node => { Object.assign(node, { size: 'sm', icon: '', iconOnly: false, accessibleLabel: '', variant: 'secondary', pressed: undefined } satisfies Partial<Button>) })
    await expect(host.locator('[part="indicator"]')).toBeHidden()
    await host.evaluate(node => { Object.assign(node, { label: 'Inputs', indicator: true, indicatorLabel: 'Edited instance inputs' } satisfies Partial<Button>) })
    await expect(host.locator('[part="indicator"]')).toBeVisible()
    await expect(host.getByRole('button', { name: 'Inputs' })).toHaveAttribute('aria-description', 'Edited instance inputs')
    await expect(host.locator('[part="indicator"]')).toHaveCSS('width', '5px')
    await host.evaluate(node => { Object.assign(node, { indicator: false } satisfies Partial<Button>) })
    await expect(host.locator('[part="indicator"]')).toBeHidden()
    await host.evaluate(node => { Object.assign(node, { label: 'Responsive action', icon: 'save', iconOnlyAt: 'md', wrap: true } satisfies Partial<Button>) })
    await expect(host).toHaveAttribute('data-icon-only-at', 'md')
    await expect(host).toHaveAttribute('data-wrap', '')
    await page.setViewportSize({ width: 600, height: 720 })
    await expect(host.locator('[part~=label]')).toHaveCSS('position', 'absolute')
    await expect(host.getByRole('button', { name: 'Responsive action' })).toBeVisible()
    await page.setViewportSize({ width: 1024, height: 720 })
    await expect(host.locator('[part~=label]')).not.toHaveCSS('position', 'absolute')
    await host.evaluate(node => { Object.assign(node, { label: 'Release action', loading: false } satisfies Partial<Button>) })
    const width = (await host.getByRole('button', { name: 'Release action' }).boundingBox())?.width
    await host.evaluate(node => { (node as Button).loading = true })
    const loadingButton = host.getByRole('button', { name: 'Release action' })
    await expect(loadingButton).toBeDisabled()
    await expect(host.locator('[part~=spinner]')).toBeVisible()
    await expect.poll(async () => (await loadingButton.boundingBox())?.width).toBe(width)
    await host.evaluate(node => { Object.assign(node, { label: 'Open details', loading: false, variant: 'link', size: 'sm' } satisfies Partial<Button>) })
    const linkAction = host.getByRole('button', { name: 'Open details' })
    await expect(linkAction).toHaveCSS('text-decoration-line', 'underline')
    await expect(linkAction).toHaveCSS('min-width', '0px')
})
