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

test('accordion resolves reactive item labels and descriptions without remounting retained content', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-accordion')))
    await page.evaluate(async () => {
        const runtimePath = '/components/core/browser.ts'
        const runtime: typeof import('../../core/browser.js') = await import(runtimePath)
        const { html, state } = runtime.browserRuntime()
        const [label, setLabel] = state('Untitled service')
        const [description, setDescription] = state('No category')
        const accordion = document.createElement('cb-accordion') as Accordion
        accordion.id = 'reactive-accordion'
        accordion.items = [{
            id: 'service',
            label,
            description,
            expanded: true,
            renderItem: () => html`<input aria-label="Service name" value="Draft">`,
        }]
        document.getElementById('fixture')!.append(accordion)
        await Promise.resolve()
        const input = accordion.contentRoot.querySelector<HTMLInputElement>('input')
        input?.focus()
        setLabel('Website analytics')
        setDescription('Marketing · USD 20')
    })

    const host = page.locator('#reactive-accordion')
    await expect(host.getByRole('button', { name: 'Website analytics Marketing · USD 20' })).toBeVisible()
    await expect(host.getByText('Marketing · USD 20', { exact: true })).toBeVisible()
    await expect(host.getByRole('textbox', { name: 'Service name' })).toBeFocused()
    await expect(host.getByRole('textbox', { name: 'Service name' })).toHaveValue('Draft')
})

test('accordion actions wrap below long header copy in narrow containers', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-accordion')))
    await page.evaluate(() => {
        const accordion = document.createElement('cb-accordion') as Accordion
        accordion.id = 'narrow-accordion'
        accordion.style.inlineSize = '390px'
        accordion.items = [{
            id: 'release',
            label: 'A deliberately long release heading that must remain readable',
            description: 'Supporting copy should keep the full content width.',
            actions: [{ id: 'delete', label: 'Delete', icon: 'trash' }],
            content: 'Release contents',
        }]
        document.getElementById('fixture')!.append(accordion)
    })

    const host = page.locator('#narrow-accordion')
    const trigger = host.locator('[part~=trigger]')
    const action = host.locator('[part~=action]')
    const [triggerBox, actionBox] = await Promise.all([
        trigger.boundingBox(),
        action.boundingBox(),
    ])
    expect(triggerBox).not.toBeNull()
    expect(actionBox).not.toBeNull()
    expect(actionBox!.y).toBeGreaterThanOrEqual(triggerBox!.y + triggerBox!.height)
    expect(triggerBox!.width).toBeGreaterThan(350)
})

test('accordion can keep compact header actions inline in narrow containers without changing expansion or actions', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-accordion')))
    await page.evaluate(() => {
        const accordion = document.createElement('cb-accordion') as Accordion
        accordion.id = 'inline-accordion'
        accordion.style.inlineSize = '280px'
        accordion.setAttribute('wrap-actions', 'false')
        accordion.items = [{ id: 'text', label: 'Text', actions: [{ id: 'reset', label: 'Reset text', icon: 'reset' }], content: 'Text controls' }]
        accordion.addEventListener('itemaction', () => { accordion.dataset.action = 'reset' })
        document.getElementById('fixture')!.append(accordion)
    })
    const host = page.locator('#inline-accordion'), trigger = host.getByRole('button', { name: 'Text', exact: true }), action = host.getByRole('button', { name: 'Reset text', exact: true })
    await expect.poll(async () => {
        const heading = await trigger.boundingBox(), reset = await action.boundingBox()
        return heading && reset ? Math.abs(heading.y + heading.height / 2 - reset.y - reset.height / 2) : Infinity
    }).toBeLessThan(2)
    await action.click()
    await expect(host).toHaveAttribute('data-action', 'reset')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.click()
    await expect(host.getByText('Text controls', { exact: true })).toBeVisible()
    await host.evaluate(node => { (node as Accordion).wrapActions = true })
    await expect.poll(async () => {
        const heading = await trigger.boundingBox(), reset = await action.boundingBox()
        return heading && reset ? reset.y - heading.y - heading.height : -Infinity
    }).toBeGreaterThanOrEqual(0)
})
