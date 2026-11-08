import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Icon } from '../../components/icons/icon/index.js'
import type { Button, ButtonVariant } from '../../components/action/button/index.js'
import type { WorkspaceProps } from '../../components/layout/workspace/WorkspaceBase.js'
import type { LayerTreeProps } from '../../components/data-display/layer-tree/LayerTreeBase.js'
import type { AccordionProps } from '../../components/data-display/accordion/AccordionBase.js'
import type { ViewportProps } from '../../components/editor/viewport/ViewportBase.js'
import type { SelectionOverlayProps } from '../../components/editor/selection-overlay/SelectionOverlayBase.js'
import type { ActionItem } from '../../components/core/items.js'

const source = '/tests/browser/fixtures/custom-icon.svg'
test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-icon')))
})

for (const appearance of ['light', 'dark']) test(`button icons inherit the text color across variants and states (${appearance})`, async ({ page }) => {
    await page.locator('#theme').evaluate((node, value) => node.setAttribute('appearance', value), appearance)
    await page.evaluate(() => {
        const button = document.createElement('cb-button') as Button
        Object.assign(button, { label: 'Button', icon: 'plus', variant: 'primary', size: 'lg' } satisfies Partial<Button>)
        document.getElementById('fixture')!.append(button)
    })
    const host = page.locator('cb-button'), button = host.getByRole('button'), label = host.locator('[part~=label]'), icon = host.locator('cb-icon')
    const matchesText = async (): Promise<void> => {
        const color = await label.evaluate(node => getComputedStyle(node).color)
        await expect(icon).toHaveCSS('color', color)
        await expect(icon.locator('svg path')).toHaveCSS('stroke', color)
    }
    for (const variant of ['primary', 'secondary', 'outline', 'ghost', 'destructive'] satisfies ButtonVariant[]) {
        await host.evaluate((node, variant) => { Object.assign(node, { variant, disabled: false, pressed: undefined } satisfies Partial<Button>) }, variant)
        await page.locator('h1').hover()
        await matchesText()
        await button.hover()
        await matchesText()
        await button.focus()
        await matchesText()
        await host.evaluate(node => { (node as Button).pressed = true })
        await matchesText()
        await host.evaluate(node => { (node as Button).disabled = true })
        await matchesText()
    }
    // Theme overrides remain the source of truth; no white/black icon override.
    await host.evaluate(node => {
        Object.assign(node, { variant: 'primary', disabled: false, pressed: undefined } satisfies Partial<Button>)
        ;(node as HTMLElement).style.setProperty('--color-primary-foreground', 'rgb(240, 230, 200)')
    })
    await expect(label).toHaveCSS('color', 'rgb(240, 230, 200)')
    await matchesText()
    await host.evaluate(node => { (node as HTMLElement).style.removeProperty('--color-primary-foreground') })
    await page.locator('h1').hover()
    await host.screenshot({ path: `/tmp/cube-button-icon-${appearance}.png` })
})

test('named and slotted SVG icons inherit surrounding text color while explicit icon colors still override it', async ({ page }) => {
    await page.evaluate(() => {
        const text = document.createElement('span')
        text.id = 'colored-text'
        text.style.color = 'rgb(130, 40, 160)'
        text.innerHTML = '<cb-icon name="plus"></cb-icon><cb-icon><svg viewBox="0 0 24 24"><path d="M2 2h20v20H2z" fill="currentColor"/></svg></cb-icon>'
        document.getElementById('fixture')!.append(text)
    })
    const icons = page.locator('#colored-text cb-icon')
    for (const icon of await icons.all()) await expect(icon).toHaveCSS('color', 'rgb(130, 40, 160)')
    await expect(icons.first().locator('svg path')).toHaveCSS('stroke', 'rgb(130, 40, 160)')
    await expect(icons.last().locator('svg path[fill=currentColor]')).toHaveCSS('fill', 'rgb(130, 40, 160)')
    await page.locator('#colored-text').evaluate(node => { (node as HTMLElement).style.color = 'rgb(15, 120, 70)' })
    for (const icon of await icons.all()) await expect(icon).toHaveCSS('color', 'rgb(15, 120, 70)')
    await icons.first().evaluate(node => { (node as HTMLElement).style.color = 'rgb(200, 30, 50)' })
    await expect(icons.first().locator('svg path')).toHaveCSS('stroke', 'rgb(200, 30, 50)')
})

test('icon supports reactive names, file sources and live SVG children with one accessible name', async ({ page }) => {
    await page.evaluate(src => {
        const icon = document.createElement('cb-icon') as Icon
        Object.assign(icon, { name: 'settings', src, accessibleLabel: 'Custom icon' })
        icon.style.color = 'rgb(200, 30, 50)'
        document.querySelector('#fixture')!.append(icon)
    }, source)
    const icon = page.locator('cb-icon'), image = icon.locator('img')
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true)
    await expect(page.getByRole('img', { name: 'Custom icon', exact: true })).toHaveCount(1)
    await icon.evaluate(node => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('data-custom', '')
        const path = document.createElementNS(svg.namespaceURI, 'path')
        path.setAttribute('d', 'M2 2h20v20H2z'); path.setAttribute('fill', 'currentColor')
        svg.append(path); node.append(svg)
    })
    await expect(icon.locator('svg[data-custom]')).toBeVisible()
    await expect(image).toBeHidden()
    await expect(icon.locator('svg[data-custom] path')).toHaveCSS('fill', 'rgb(200, 30, 50)')
    await expect(icon.locator('svg[data-custom]')).toHaveCSS('width', '16px')
    await icon.evaluate(node => node.replaceChildren())
    await expect(image).toBeVisible()
    await icon.evaluate(node => { (node as Icon).src = ''; (node as Icon).name = 'ruler' })
    await expect(icon.locator('svg[part=glyph] path')).toHaveAttribute('d', /.+/)
    await expect(image).toHaveCount(0)
    expect((await new AxeBuilder({ page }).include('cb-icon').analyze()).violations).toEqual([])
})

test('external SVG scripts are inert and unsafe source protocols are not loaded', async ({ page }) => {
    await page.evaluate(() => {
        const icon = document.createElement('cb-icon') as Icon
        icon.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>document.body.dataset.iconExecuted="true"</script><circle cx="12" cy="12" r="10"/></svg>')
        document.querySelector('#fixture')!.append(icon)
    })
    await expect(page.locator('cb-icon img')).toBeVisible()
    await expect(page.locator('body')).not.toHaveAttribute('data-icon-executed', 'true')
    await page.locator('cb-icon').evaluate(node => { (node as Icon).src = 'javascript:alert(1)' })
    await expect(page.locator('cb-icon img')).toHaveCount(0)
})

for (const tag of ['cb-button', 'cb-link', 'cb-split-button', 'cb-dropdown', 'cb-empty-state']) {
    test(`${tag} forwards icon-src without requiring a built-in icon name`, async ({ page }) => {
        await page.evaluate(({ tag, source }) => {
            const node = document.createElement(tag)
            node.setAttribute('icon-src', source); node.setAttribute('icon', '')
            node.setAttribute('label', 'Custom'); node.setAttribute('accessible-label', 'Custom')
            document.querySelector('#fixture')!.append(node)
        }, { tag, source })
        const image = page.locator(`${tag} cb-icon img`).first()
        await expect(image).toHaveAttribute('src', source)
        await expect(image).toBeVisible()
        await page.locator(tag).first().evaluate((node, src) => node.setAttribute('icon-src', `${src}?updated`), source)
        await expect(image).toHaveAttribute('src', `${source}?updated`)
        await page.locator(tag).first().evaluate(node => node.removeAttribute('icon-src'))
        await expect(page.locator(`${tag} cb-icon img`)).toHaveCount(0)
    })
}

for (const tag of ['cb-menu', 'cb-button-group', 'cb-segmented-control', 'cb-tabs', 'cb-breadcrumb', 'cb-command-palette']) {
    test(`${tag} preserves custom icon sources on items`, async ({ page }) => {
        await page.evaluate(({ tag, source }) => {
            const node = document.createElement(tag)
            const items: ActionItem[] = [{ id: 'one', label: 'Custom', iconSrc: source }]
            Object.assign(node, { items, accessibleLabel: 'Custom items', open: tag === 'cb-command-palette' })
            document.querySelector('#fixture')!.append(node)
        }, { tag, source })
        await expect(page.locator(`${tag} cb-icon img`).first()).toBeVisible()
        await expect(page.locator(`${tag} cb-icon img`).first()).toHaveAttribute('src', source)
    })
}

test('workspace tabs, layers and editor/accordion actions preserve custom sources', async ({ page }) => {
    await page.evaluate(source => {
        const fixture = document.querySelector('#fixture')!
        const workspace = document.createElement('cb-workspace')
        Object.assign(workspace, { variant: 'tabbed', startItems: [{ id: 'custom', name: 'Custom panel', iconSrc: source, renderContent: () => document.createTextNode('Panel') }] } satisfies WorkspaceProps)
        const layers = document.createElement('cb-layer-tree')
        Object.assign(layers, { accessibleLabel: 'Layers', items: [{ id: 'custom', label: 'Custom layer', iconSrc: source, actions: [{ id: 'edit', label: 'Edit', iconSrc: source }] }] } satisfies LayerTreeProps)
        const accordion = document.createElement('cb-accordion')
        Object.assign(accordion, { items: [{ id: 'custom', label: 'Custom group', actions: [{ id: 'edit', label: 'Edit', iconSrc: source }] }] } satisfies AccordionProps)
        const viewport = document.createElement('cb-viewport')
        Object.assign(viewport, { accessibleLabel: 'Canvas', controls: false, positionLabel: '', actions: [{ id: 'edit', label: 'Edit', iconSrc: source, position: 'top-left' }] } satisfies ViewportProps)
        const selection = document.createElement('cb-selection-overlay')
        Object.assign(selection, { accessibleLabel: 'Selection', rect: { x: 100, y: 100, width: 150, height: 100 }, actions: [{ id: 'edit', label: 'Edit', iconSrc: source }] } satisfies SelectionOverlayProps)
        fixture.append(workspace, layers, accordion, viewport, selection)
    }, source)
    for (const selector of ['cb-workspace [part~=workspace-tab]', 'cb-layer-tree [part~=type-icon]', 'cb-layer-tree [part~=node-action]', 'cb-accordion [part~=action]', 'cb-viewport [part~=action]', 'cb-selection-overlay [part~=action]']) {
        await expect(page.locator(selector).locator('img').first()).toHaveAttribute('src', source)
    }
})
