import { expect } from '@playwright/test'
import type { Menu } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-menu', 'navigation--menu', async ({ host }) => {
    await expect(host.locator('[part="custom-item"] strong')).toHaveText('Custom item')
    await expect(host.locator('[part="custom-item"]')).toHaveCSS('border-radius', '6px')
    await expect(host.locator('[part="custom-item"] cb-button, [part="custom-item"] cb-link')).toHaveCount(0)
    await host.evaluate(node => { Object.assign(node, {"items":[
        { id: 'release', label: 'Release menu', type: 'checkbox', checked: true, renderItem: item => {
            const link = document.createElement('a')
            link.href = '#release'
            link.textContent = `Custom ${item.label}`
            return link
        } },
        {"id":"delete","label":"Delete release","group":"danger","tone":"danger"},
    ]} satisfies Partial<Menu>) })
    await expect(host.getByRole('menuitemcheckbox', { name: 'Release menu' })).toHaveAttribute('aria-checked', 'true')
    await expect(host.locator('[part="custom-item"] a')).toHaveText('Custom Release menu')
    await expect(host.locator('cb-button[part="item"], cb-link[part="item"]')).toHaveCount(1)
    await host.evaluate(node => {
        node.setAttribute('data-action-count', '0')
        node.addEventListener('action', event => {
            node.setAttribute('data-action-count', String(Number(node.getAttribute('data-action-count')) + 1))
            if (event instanceof CustomEvent) {
                const detail = (event as CustomEvent<{ id: string }>).detail
                node.setAttribute('data-action-id', detail.id)
            }
        })
    })
    await host.locator('[part="custom-item"] a').click()
    await expect(host).toHaveAttribute('data-action-count', '1')
    await expect(host).toHaveAttribute('data-action-id', 'release')
    await host.getByRole('menuitemcheckbox', { name: 'Release menu' }).press('Enter')
    await expect(host).toHaveAttribute('data-action-count', '2')
    await host.evaluate(node => {
        const menu = node as Menu
        menu.items = menu.items.map(item => item.id === 'release' ? { ...item, renderItem: () => 'Updated item' } : item)
    })
    await expect(host.getByRole('menuitemcheckbox', { name: 'Release menu' })).toContainText('Updated item')
    await host.evaluate(node => {
        const menu = node as Menu
        menu.items = menu.items.map(item => item.id === 'release' ? { ...item, renderItem: undefined } : item)
    })
    await expect(host.getByRole('menuitemcheckbox', { name: 'Release menu' })).toContainText('Release menu')
    await expect(host.locator('[part="custom-item"]')).toHaveCount(0)
    await expect(host.locator('[part=separator]')).toHaveCount(1)
    await expect(host.getByRole('menuitem', { name: 'Delete release' })).toHaveAttribute('data-tone', 'danger')
    await host.evaluate(node => {
        if (!node.parentElement) throw new Error('Expected a menu container')
        node.parentElement.style.height = '160px'
        node.parentElement.style.padding = '0'
        node.style.setProperty('--typography-body-font-size', '16px')
        Object.assign(node, {
            gap: '12px',
            items: [
                { id: 'first', label: 'First item', icon: 'plus' },
                { id: 'second', label: 'Second item', icon: 'plus', href: '#second' },
            ],
        } satisfies Partial<Menu>)
    })
    const menu = host.getByRole('menu')
    await expect(host).toHaveCSS('height', '160px')
    await expect(menu).toHaveCSS('height', '160px')
    await expect(menu).toHaveCSS('padding', '0px')
    await expect(menu).toHaveCSS('border-width', '0px')
    await expect(menu).toHaveCSS('border-radius', '0px')
    await expect(menu).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(menu).toHaveCSS('row-gap', '12px')
    const firstLabel = host.locator('[part="item-label"]').first()
    const secondLabel = host.locator('[part="item-label"]').last()
    const icon = host.locator('cb-icon[part="icon"] [part="icon"]').first()
    const firstItem = host.getByRole('menuitem', { name: 'First item', exact: true })
    const secondItem = host.locator('cb-link[part="item"][data-label="Second item"]')
    await expect(menu).toHaveAttribute('data-variant', 'both')
    await host.evaluate(node => node.setAttribute('active', 'first'))
    await expect(firstItem).toHaveAttribute('aria-current', 'true')
    await expect(firstItem).toHaveAttribute('data-active', '')
    await host.evaluate(node => { (node as Menu).active = 'second' })
    await expect(secondItem).toHaveAttribute('aria-current', 'true')
    await expect(firstItem).not.toHaveAttribute('aria-current')
    await expect(firstItem).not.toHaveAttribute('data-active')
    await host.evaluate(node => node.setAttribute('variant', 'icon'))
    await expect(firstLabel).toBeHidden()
    await expect(icon).toBeVisible()
    await expect(firstItem).toBeVisible()
    await host.evaluate(node => { (node as Menu).variant = 'label' })
    await expect(firstLabel).toBeVisible()
    await expect(icon).toBeHidden()
    await host.evaluate(node => {
        Object.assign(node, { variant: 'both', active: 'missing' } satisfies Partial<Menu>)
    })
    await expect(firstLabel).toBeVisible()
    await expect(icon).toBeVisible()
    await expect(host.locator('[data-active]')).toHaveCount(0)
    for (const [size, pixels] of [
        ['tiny', 10], ['xs', 12], ['sm', 16], ['md', 18], ['lg', 20], ['xl', 24],
    ] as const) {
        await host.evaluate((node, size) => node.setAttribute('size', size), size)
        await expect(firstLabel).toHaveCSS('font-size', `${pixels}px`)
        await expect(secondLabel).toHaveCSS('font-size', `${pixels}px`)
        await expect(icon).toHaveCSS('width', `${pixels}px`)
    }
    await host.evaluate(node => {
        node.setAttribute('gap', '4px')
        Object.assign(node, {
            items: Array.from({ length: 20 }, (_, index) => ({ id: `item-${index}`, label: `Item ${index}` })),
        } satisfies Partial<Menu>)
    })
    await expect(menu).toHaveCSS('row-gap', '4px')
    await expect(host.locator('[part="item"]')).toHaveCount(20)
    await expect.poll(() => menu.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true)
})
