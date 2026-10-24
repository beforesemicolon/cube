import { expect, test } from '@playwright/test'
import type { Accordion } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-accordion', 'data-display--accordion', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release settings","content":"Release contents"}],"expandedIds":["release"]} satisfies Partial<Accordion>) })
    await expect(host.getByText("Release contents", { exact: true }).first()).toBeVisible()
})

test('accordion lazily renders templates and nodes once, retains collapsed content, and keeps content fallback', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-accordion')))
    await page.evaluate(async () => {
        const runtimePath = '/components/core/browser.ts'
        const runtime: typeof import('../../core/browser.js') = await import(runtimePath)
        const { html } = runtime.browserRuntime()
        const accordion = document.createElement('cb-accordion') as Accordion
        accordion.id = 'lazy-accordion'
        let calls = 0
        const count = (): void => { accordion.dataset.calls = String(++calls) }
        Object.assign(accordion, { multiple: true, items: [
            { id: 'template', label: 'Template', content: 'Ignored fallback', renderItem: () => {
                count()
                return html`<input aria-label="Retained draft"><span>Template content</span>`
            } },
            { id: 'node', label: 'Node', renderItem: () => {
                count()
                const node = document.createElement('p'); node.textContent = 'Node content'; return node
            } },
            { id: 'fallback', label: 'Fallback', content: 'Fallback content' },
            { id: 'legacy', label: 'Legacy', renderContent: () => 'Legacy renderer content' },
        ] } satisfies Partial<Accordion>)
        accordion.dataset.calls = '0'
        document.getElementById('fixture')!.append(accordion)
    })
    const host = page.locator('#lazy-accordion')
    await expect(host).toHaveAttribute('data-calls', '0')
    await expect(host.getByRole('textbox', { name: 'Retained draft' })).toHaveCount(0)
    await host.getByRole('button', { name: 'Template', exact: true }).click()
    await host.getByRole('textbox', { name: 'Retained draft' }).fill('Keep me')
    await expect(host).toHaveAttribute('data-calls', '1')
    await host.getByRole('button', { name: 'Node', exact: true }).click()
    await expect(host.getByText('Node content', { exact: true })).toBeVisible()
    await expect(host.getByRole('textbox', { name: 'Retained draft' })).toBeVisible()
    await host.getByRole('button', { name: 'Template', exact: true }).click()
    await expect(host.getByRole('textbox', { name: 'Retained draft' })).toBeHidden()
    await host.getByRole('button', { name: 'Template', exact: true }).click()
    await expect(host.getByRole('textbox', { name: 'Retained draft' })).toHaveValue('Keep me')
    await expect(host).toHaveAttribute('data-calls', '2')
    await expect(host.getByText('Ignored fallback', { exact: true })).toHaveCount(0)
    await host.getByRole('button', { name: 'Fallback', exact: true }).click()
    await expect(host.getByText('Fallback content', { exact: true })).toBeVisible()
    await host.getByRole('button', { name: 'Legacy', exact: true }).click()
    await expect(host.getByText('Legacy renderer content', { exact: true })).toBeVisible()
    await host.evaluate(node => {
        const accordion = node as Accordion
        accordion.items = accordion.items.map(item => item.id === 'template'
            ? { ...item, renderItem: () => document.createTextNode('Replacement content') } : item)
    })
    await expect(host.getByText('Replacement content', { exact: true })).toBeVisible()
    await expect(host.getByRole('textbox', { name: 'Retained draft' })).toHaveCount(0)
})
