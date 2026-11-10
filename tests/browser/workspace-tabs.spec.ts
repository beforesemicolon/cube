import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Workspace, WorkspaceTabChangeDetail } from '../../components/layout/workspace/index.js'

interface TabStats {
    calls: Record<string, number>
    mounts: Record<string, number>
    unmounts: Record<string, number>
    changes: Omit<WorkspaceTabChangeDetail, 'originalEvent'>[]
    actions: number
    errors: string[]
}
declare global { interface Window { workspaceTabStats: TabStats } }

async function mount(page: Page, mobile = false, persistKey = ''): Promise<void> {
    await page.evaluate(async ({ mobile, persistKey }) => {
        const runtimePath = '/components/core/browser.ts'
        const runtime: typeof import('../../components/core/browser.js') = await import(runtimePath)
        const { html } = runtime.browserRuntime()
        const stats: TabStats = { calls: {}, mounts: {}, unmounts: {}, changes: [], actions: 0, errors: [] }
        window.workspaceTabStats = stats
        customElements.define('workspace-tab-probe', class extends HTMLElement {
            connectedCallback(): void {
                const id = this.dataset.id!
                stats.mounts[id] = (stats.mounts[id] ?? 0) + 1
            }
            disconnectedCallback(): void {
                const id = this.dataset.id!
                stats.unmounts[id] = (stats.unmounts[id] ?? 0) + 1
            }
        })
        const template = (id: string) => () => {
            stats.calls[id] = (stats.calls[id] ?? 0) + 1
            return html`<workspace-tab-probe data-id=${id}><input aria-label=${`${id} input`} placeholder=${id}></workspace-tab-probe>`
        }
        const workspace = document.createElement('cb-workspace') as Workspace
        Object.assign(workspace, {
            variant: 'tabbed', persistKey, startSize: 260, endSize: 280, bottomSize: 160, mobileBreakpoint: 600,
            accessibleLabel: 'Canvas', startLabel: 'Navigation', endLabel: 'Inspector', bottomLabel: 'Tools', closeMobileLabel: 'Close mobile panel',
            startItems: [
                { id: 'pages', name: 'Pages', description: 'Browse project pages.', iconName: 'file', renderContent: template('pages') },
                { id: 'layers', name: 'Layers', description: 'Explore the page structure.', iconName: 'layers', renderContent: template('layers') },
            ],
            endItems: [{ id: 'properties', name: 'Properties', collapsedName: 'Inspect', iconName: 'settings', renderContent: template('properties') }],
            bottomItems: [
                { id: 'console', name: 'Console', renderContent: () => {
                    stats.calls.console = (stats.calls.console ?? 0) + 1
                    const node = document.createElement('workspace-tab-probe')
                    node.dataset.id = 'console'; node.textContent = 'Console output'
                    return node
                } },
                { id: 'history', name: 'History', renderContent: template('history') },
            ],
        } satisfies Partial<Workspace>)
        workspace.style.cssText = `width:${mobile ? 480 : 1000}px;height:600px`
        const main = document.createElement('p'); main.textContent = 'Canvas content'
        const legacy = document.createElement('p'); legacy.slot = 'start'; legacy.textContent = 'Legacy panel'
        workspace.append(main, legacy)
        workspace.addEventListener('change', event => {
            const { panel, value, previousValue, open, previousOpen } = (event as CustomEvent<WorkspaceTabChangeDetail>).detail
            stats.changes.push({ panel, value, previousValue, open, previousOpen })
        })
        workspace.addEventListener('action', () => { stats.actions++ })
        workspace.addEventListener('error', (event: Event) => {
            if (!(event instanceof CustomEvent)) return
            event.stopPropagation()
            const detail = (event as CustomEvent<{ error: Error }>).detail
            stats.errors.push(detail.error.message)
        })
        document.querySelector('#fixture')!.append(workspace)
    }, { mobile, persistKey })
    await expect(page.locator('cb-workspace')).toHaveAttribute('data-variant', 'tabbed')
    if (mobile) await expect(page.locator('cb-workspace')).toHaveAttribute('data-mobile', '')
}

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-workspace')))
})

test('tab content is lazy, unmounts on switch/collapse, and unrelated panels retain user state', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await mount(page)
    const workspace = page.locator('cb-workspace')
    await expect(workspace).toHaveCSS('border-radius', '0px')
    await expect(workspace.getByRole('textbox', { name: 'pages input' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => window.workspaceTabStats.calls)).toEqual({ pages: 1, properties: 1 })
    await workspace.getByRole('textbox', { name: 'properties input' }).fill('Preserved')
    await expect(workspace.getByRole('textbox', { name: 'properties input' })).toHaveValue('Preserved')
    await workspace.getByRole('textbox', { name: 'properties input' }).evaluate(node => { node.setAttribute('data-retained', 'true') })
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(workspace.getByRole('textbox', { name: 'pages input' })).toHaveCount(0)
    await expect(workspace.getByRole('textbox', { name: 'layers input' })).toBeVisible()
    expect(await page.evaluate(() => window.workspaceTabStats.calls)).toEqual({ pages: 1, properties: 1, layers: 1 })
    expect(await page.evaluate(() => ({ mounts: window.workspaceTabStats.mounts.properties, unmounts: window.workspaceTabStats.unmounts.properties ?? 0 }))).toEqual({ mounts: 1, unmounts: 0 })
    await expect(workspace.getByRole('textbox', { name: 'properties input' })).toHaveAttribute('data-retained', 'true')
    await expect(workspace.getByRole('textbox', { name: 'properties input' })).toHaveValue('Preserved')
    await expect.poll(() => page.evaluate(() => window.workspaceTabStats.unmounts.pages)).toBe(1)
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(workspace.locator('workspace-tab-probe[data-id=layers]')).toHaveCount(0)
    await expect(workspace.getByRole('tab', { name: 'Layers', exact: true })).toHaveAttribute('aria-selected', 'false')
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.workspaceTabStats.calls.layers)).toBe(2)
    await workspace.getByRole('tab', { name: 'Console', exact: true }).click()
    await expect(workspace.locator('workspace-tab-probe[data-id=console]')).toHaveText('Console output')
    await workspace.getByRole('tab', { name: 'History', exact: true }).click()
    await expect(workspace.locator('workspace-tab-probe[data-id=console]')).toHaveCount(0)
    await expect.poll(() => page.evaluate(() => window.workspaceTabStats.unmounts.console)).toBe(1)
    await workspace.evaluate(node => { (node as Workspace).resizePanel('start', 300) })
    expect(await page.evaluate(() => window.workspaceTabStats.calls)).toEqual({ pages: 1, properties: 1, layers: 2, console: 1, history: 1 })
    expect(await page.evaluate(() => window.workspaceTabStats.changes.slice(0, 3))).toEqual([
        { panel: 'start', value: 'layers', previousValue: 'pages', open: true, previousOpen: true },
        { panel: 'start', value: 'layers', previousValue: 'layers', open: false, previousOpen: true },
        { panel: 'start', value: 'layers', previousValue: 'layers', open: true, previousOpen: false },
    ])
    expect(await page.evaluate(() => window.workspaceTabStats.actions)).toBe(0)
    expect(await page.evaluate(() => window.workspaceTabStats.errors)).toEqual([])
    expect(errors).toEqual([])
})

test('tab content fills the remaining panel height and supports an independently scrolling inspector', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    await workspace.evaluate(node => {
        const workspace = node as Workspace
        workspace.endItems = [{ id: 'inspector', name: 'Inspector', renderContent: () => {
            const inspector = document.createElement('section')
            inspector.style.cssText = 'display:flex;flex-direction:column;height:100%;min-height:0'
            const body = document.createElement('main')
            body.style.cssText = 'flex:1;overflow:auto;min-height:0'
            const tall = document.createElement('div'); tall.style.height = '1500px'; tall.textContent = 'Long inspector'
            body.append(tall)
            const footer = document.createElement('button'); footer.textContent = 'Apply inspector'; footer.style.flex = 'none'
            inspector.append(body, footer)
            return inspector
        } }]
    })
    const footer = workspace.getByRole('button', { name: 'Apply inspector', exact: true })
    await expect(footer).toBeInViewport()
    const panel = await workspace.getByRole('tabpanel', { name: 'Inspector', exact: true }).boundingBox()
    const bounds = await footer.boundingBox()
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(panel!.y + panel!.height + 1)
    await expect.poll(() => workspace.locator('[part~=tab-content]').last().evaluate(node => node.scrollHeight <= node.clientHeight + 1)).toBe(true)
})

test('controlled selection, array changes, empty regions and legacy slots remain reactive', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    await workspace.evaluate(node => { (node as Workspace).startValue = 'layers' })
    await expect(workspace.getByRole('textbox', { name: 'layers input' })).toBeVisible()
    await workspace.evaluate(node => {
        const workspace = node as Workspace
        workspace.startItems = workspace.startItems.filter(item => item.id === 'pages')
        workspace.endItems = []
    })
    await expect(workspace.getByRole('textbox', { name: 'pages input' })).toBeVisible()
    await expect(workspace.getByRole('tab', { name: 'Layers', exact: true })).toHaveCount(0)
    await expect(workspace.locator('[part~=end-tabs-region]')).toBeHidden()
    await expect(workspace).toHaveCSS('--workspace-end-track', '0px')
    await workspace.evaluate(node => { (node as Workspace).variant = 'default' })
    await expect(workspace.getByText('Legacy panel')).toBeVisible()
    await expect(workspace.getByRole('tab')).toHaveCount(0)
    await expect(workspace.locator('workspace-tab-probe')).toHaveCount(0)
    await workspace.evaluate(node => { (node as Workspace).variant = 'tabbed' })
    await expect(workspace.getByRole('textbox', { name: 'pages input' })).toBeVisible()
    expect(await page.evaluate(() => window.workspaceTabStats.changes)).toEqual([])
    expect(await page.evaluate(() => window.workspaceTabStats.errors)).toEqual([])
})

test('open panels own their name and optional description while rail tabs stay icon-only', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    const heading = workspace.locator('[part~=start-panel] cb-panel-header[part~=tab-heading]')
    await expect(heading).toHaveJSProperty('label', 'Pages')
    await expect(heading).toHaveJSProperty('description', 'Browse project pages.')
    await expect(heading.locator('p[part=description]')).toHaveText('Browse project pages.')
    const pages = workspace.getByRole('tab', { name: 'Pages', exact: true })
    await expect(pages).toHaveJSProperty('iconOnly', true)
    await expect(pages.locator('cb-icon[part=icon]')).toBeVisible()
    await expect(pages.locator('[part~=button-label]')).toHaveAttribute('part', 'button-label sr-only')
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(heading).toHaveJSProperty('label', 'Layers')
    await expect(heading).toHaveJSProperty('description', 'Explore the page structure.')
    const inspector = workspace.locator('[part~=end-panel] cb-panel-header')
    await expect(inspector).toHaveJSProperty('label', 'Properties')
    await expect(inspector.locator('p[part=description]')).toBeHidden()
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(heading).toHaveCount(0)
    await expect(workspace.getByRole('tab', { name: 'Layers', exact: true }).locator('cb-icon[part=icon]')).toBeVisible()
    expect(await page.evaluate(() => window.workspaceTabStats.errors)).toEqual([])
})

test('tabs without icons keep vertical name fallbacks on side rails and horizontal bottom names', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    await workspace.evaluate(node => {
        const workspace = node as Workspace
        workspace.startItems = workspace.startItems.map(item => ({ ...item, iconName: undefined }))
        workspace.endItems = workspace.endItems.map(item => ({ ...item, iconName: undefined }))
    })
    const pages = workspace.getByRole('tab', { name: 'Pages', exact: true })
    await expect(pages).toHaveJSProperty('iconOnly', false)
    await expect(pages.locator('[part~=button-label]')).toHaveText('Pages')
    await expect(pages.locator('[part~=button-label]')).toHaveCSS('writing-mode', 'vertical-rl')
    await pages.click()
    await expect(pages.locator('[part~=button-label]')).toHaveCSS('writing-mode', 'vertical-rl')
    const inspector = workspace.getByRole('tab', { name: 'Inspect: Properties', exact: true })
    await expect(inspector.locator('[part~=button-label]')).toHaveText('Inspect')
    const consoleTab = workspace.getByRole('tab', { name: 'Console', exact: true })
    await expect(consoleTab.locator('[part~=button-label]')).toHaveCSS('writing-mode', 'horizontal-tb')
    await consoleTab.click()
    await expect(workspace.locator('[part~=bottom-panel] cb-panel-header')).toHaveJSProperty('label', 'Console')
})

test('tab changes can be vetoed and disabled workspaces do not activate', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    await workspace.evaluate(node => node.addEventListener('beforechange', event => event.preventDefault(), { once: true }))
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(workspace.getByRole('textbox', { name: 'pages input' })).toBeVisible()
    await workspace.evaluate(node => node.addEventListener('beforepaneltoggle', event => event.preventDefault(), { once: true }))
    await workspace.getByRole('tab', { name: 'Pages', exact: true }).click()
    await expect(workspace.getByRole('textbox', { name: 'pages input' })).toBeVisible()
    await workspace.evaluate(node => { (node as Workspace).disabled = true })
    expect(await workspace.evaluate(node => (node as Workspace).selectTab('start', 'layers'))).toBe(false)
    expect(await page.evaluate(() => window.workspaceTabStats.changes)).toEqual([])
})

test('side and bottom tabs use manual keyboard activation and unique ARIA associations', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    const pages = workspace.getByRole('tab', { name: 'Pages', exact: true })
    const layers = workspace.getByRole('tab', { name: 'Layers', exact: true })
    await pages.focus(); await pages.press('ArrowDown')
    await expect(layers).toBeFocused()
    await expect(pages).toHaveAttribute('aria-selected', 'true')
    await layers.press('Enter')
    await expect(layers).toHaveAttribute('aria-selected', 'true')
    await layers.press('Home'); await expect(pages).toBeFocused()
    await pages.press('End'); await expect(layers).toBeFocused()
    const consoleTab = workspace.getByRole('tab', { name: 'Console', exact: true })
    await consoleTab.focus(); await consoleTab.press('ArrowRight')
    const history = workspace.getByRole('tab', { name: 'History', exact: true })
    await expect(history).toBeFocused(); await history.press('Space')
    await expect(workspace.getByRole('textbox', { name: 'history input' })).toBeVisible()
    const associations = await workspace.evaluate(node => [...node.shadowRoot!.querySelectorAll('[role=tab]')].map(tab => {
        const panel = node.shadowRoot!.getElementById(tab.getAttribute('aria-controls')!)
        return Boolean(panel && panel.getAttribute('role') === 'tabpanel')
    }))
    expect(associations.every(Boolean)).toBe(true)
    await workspace.evaluate(node => {
        const other = document.createElement('cb-workspace') as Workspace
        other.variant = 'tabbed'; other.startItems = (node as Workspace).startItems
        other.style.cssText = 'width:1000px;height:600px'
        document.querySelector('#fixture')!.append(other)
    })
    const ids = await page.locator('cb-workspace').evaluateAll(nodes => nodes.flatMap(node => [...node.shadowRoot!.querySelectorAll('[id]')].map(child => child.id)))
    expect(new Set(ids).size).toBe(ids.length)
})

test('mobile rails remain available and only one active panel is mounted', async ({ page }) => {
    await mount(page, true)
    const workspace = page.locator('cb-workspace')
    await expect(workspace.getByRole('tab')).toHaveCount(5)
    await expect(workspace.locator('workspace-tab-probe')).toHaveCount(0)
    expect(await page.evaluate(() => window.workspaceTabStats.calls)).toEqual({})
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(workspace.getByRole('textbox', { name: 'layers input' })).toBeVisible()
    await expect(workspace.getByRole('tab', { name: 'Layers', exact: true }).locator('cb-icon[part=icon]')).toBeVisible()
    await expect(workspace.locator('[part~=start-panel] cb-panel-header')).toHaveJSProperty('label', 'Layers')
    await workspace.getByRole('tab', { name: /Properties/ }).click()
    await expect(workspace.getByRole('textbox', { name: 'layers input' })).toHaveCount(0)
    await expect(workspace.getByRole('textbox', { name: 'properties input' })).toBeVisible()
    await workspace.getByRole('tab', { name: /Properties/ }).click()
    await expect(workspace.locator('workspace-tab-probe')).toHaveCount(0)
    await workspace.getByRole('tab', { name: 'Console', exact: true }).click()
    await expect(workspace.locator('workspace-tab-probe')).toHaveCount(1)
    await workspace.getByRole('button', { name: 'Close mobile panel', exact: true }).click({ position: { x: 200, y: 100 } })
    await expect(workspace.locator('workspace-tab-probe')).toHaveCount(0)
    await workspace.evaluate(node => { (node as HTMLElement).style.width = '1000px' })
    await expect(workspace).not.toHaveAttribute('data-mobile')
    await expect(workspace.getByRole('textbox', { name: 'layers input' })).toBeVisible()
    expect(await page.evaluate(() => window.workspaceTabStats.errors)).toEqual([])
})

test('persisted selections restore alongside sizes and legacy states remain supported', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    await workspace.evaluate(node => {
        const workspace = node as Workspace
        workspace.persistKey = 'workspace-tabs-test'
        workspace.selectTab('start', 'layers')
        workspace.resizePanel('start', 320)
        const restored = document.createElement('cb-workspace') as Workspace
        restored.variant = 'tabbed'; restored.persistKey = workspace.persistKey; restored.startItems = workspace.startItems
        restored.style.cssText = 'width:1000px;height:600px'
        document.querySelector('#fixture')!.append(restored)
    })
    const restored = page.locator('cb-workspace').nth(1)
    await expect(restored.getByRole('tab', { name: 'Layers', exact: true })).toHaveAttribute('aria-selected', 'true')
    expect(await restored.evaluate(node => (node as Workspace).startSize)).toBe(320)
    await restored.evaluate(node => {
        localStorage.setItem('workspace-legacy-test', '0:1:0:250:300:180')
        const legacy = document.createElement('cb-workspace') as Workspace
        legacy.persistKey = 'workspace-legacy-test'; legacy.style.cssText = 'width:1000px;height:600px'
        node.after(legacy)
    })
    expect(await page.locator('cb-workspace').nth(2).evaluate(node => ({ open: (node as Workspace).startOpen, size: (node as Workspace).startSize }))).toEqual({ open: false, size: 250 })
})

test('initial saved selection is restored before calling any content factory', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('workspace-initial-tabs', '1:0:0:260:280:160:layers:properties:console'))
    await mount(page, false, 'workspace-initial-tabs')
    await expect(page.locator('cb-workspace').getByRole('textbox', { name: 'layers input' })).toBeVisible()
    expect(await page.evaluate(() => window.workspaceTabStats.calls)).toEqual({ layers: 1 })
})

test('factory failures are reported and switching to another tab recovers', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    await workspace.evaluate(node => {
        const workspace = node as Workspace
        workspace.startItems = [...workspace.startItems, { id: 'broken', name: 'Broken', renderContent: () => { throw new Error('Broken factory') } }]
    })
    await workspace.getByRole('tab', { name: 'Broken', exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.workspaceTabStats.errors)).toEqual(['Broken factory'])
    await workspace.getByRole('tab', { name: 'Pages', exact: true }).click()
    await expect(workspace.getByRole('textbox', { name: 'pages input' })).toBeVisible()
})

test('invalid and duplicate tab metadata is ignored without invoking inactive factories', async ({ page }) => {
    await mount(page)
    const workspace = page.locator('cb-workspace')
    await workspace.evaluate(node => {
        const workspace = node as Workspace
        const duplicate = { id: 'pages', name: 'Duplicate', renderContent: () => { throw new Error('Must not render') } }
        workspace.startItems = [...workspace.startItems, duplicate, { ...duplicate, id: '' }, { ...duplicate, id: 'empty-name', name: '' }]
        workspace.bottomItems = [{ id: 'inactive', name: 'Inactive', renderContent: duplicate.renderContent }]
    })
    await expect(workspace.getByRole('tab')).toHaveCount(4)
    await expect(workspace.getByRole('tab', { name: 'Duplicate' })).toHaveCount(0)
    expect(await workspace.evaluate(node => (node as Workspace).startItems.length)).toBe(5)
    expect(await page.evaluate(() => window.workspaceTabStats.errors)).toEqual([])
})

test('Storybook exposes both variants with working live tab controls', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/?path=/story/layout--workspace')
    const workspace = page.frameLocator('#storybook-preview-iframe').locator('cb-workspace[data-story-component]')
    await expect(workspace.getByRole('button', { name: 'Close pages and layers' })).toBeVisible()
    await page.locator('#control-variant').selectOption('tabbed')
    await expect(workspace.getByRole('tab', { name: 'Pages', exact: true })).toBeVisible()
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(workspace.getByText('Layers panel content', { exact: true })).toBeVisible()
    await expect(workspace.getByText('Pages panel content', { exact: true })).toHaveCount(0)
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(workspace.getByText('Layers panel content', { exact: true })).toHaveCount(0)
    await page.locator('#control-variant').selectOption('default')
    await expect(workspace.getByRole('button', { name: 'Close pages and layers' })).toBeVisible()
})

test('tabbed workspace example opens side and bottom content and collapses from its tabs', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--tabbed-workspace&viewMode=story')
    const workspace = page.locator('cb-workspace')
    await expect(workspace.getByRole('tab', { name: 'Pages', exact: true })).toBeVisible()
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(workspace.getByText('Hero', { exact: true })).toBeVisible()
    await workspace.getByRole('tab', { name: 'Console', exact: true }).click()
    await expect(workspace.getByText('Ready. No errors.', { exact: true })).toBeVisible()
    await workspace.screenshot({ path: 'test-results/workspace-tabbed-example.png' })
    await workspace.getByRole('tab', { name: 'Layers', exact: true }).click()
    await expect(workspace.getByText('Hero', { exact: true })).toHaveCount(0)
})

for (const theme of ['light', 'dark'] as const) {
    test(`tabbed workspace is accessible expanded and collapsed in ${theme}`, async ({ page }) => {
        await mount(page)
        await page.evaluate(theme => {
            // The workspace supplies this isolated fixture's main landmark.
            document.querySelector('main')!.setAttribute('role', 'presentation')
            const provider = document.createElement('cb-theme-provider')
            provider.setAttribute('appearance', theme)
            document.querySelector('#fixture')!.append(provider)
            provider.append(document.querySelector('cb-workspace')!)
        }, theme)
        const workspace = page.locator('cb-workspace')
        await expect(workspace.getByRole('textbox', { name: 'pages input' })).toBeVisible()
        const expanded = await new AxeBuilder({ page }).include('cb-workspace').analyze()
        expect(expanded.violations).toEqual([])
        await workspace.screenshot({ path: `test-results/workspace-tabbed-${theme}-expanded.png` })
        await workspace.getByRole('tab', { name: 'Pages', exact: true }).click()
        await workspace.getByRole('tab', { name: 'Properties', exact: true }).click()
        await expect(workspace.getByRole('tab', { name: 'Properties', exact: true })).toBeVisible()
        expect(await workspace.getByRole('tab', { name: 'Pages', exact: true }).evaluate(node => {
            const label = node.shadowRoot!.querySelector('[part~=button-label], [part=label]')!
            return { part: label.getAttribute('part'), writingMode: getComputedStyle(label).writingMode }
        })).toMatchObject({ part: 'button-label sr-only', writingMode: 'vertical-rl' })
        const collapsed = await new AxeBuilder({ page }).include('cb-workspace').analyze()
        expect(collapsed.violations).toEqual([])
        await workspace.screenshot({ path: `test-results/workspace-tabbed-${theme}.png` })
    })
}
