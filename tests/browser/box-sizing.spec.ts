import { expect, test } from '@playwright/test'
import { componentEntries } from '../../scripts/component-entries.js'

test('every component owns border-box sizing for its host, shadow elements and pseudo-elements', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-viewport')))
    const tags = [...new Set(componentEntries.map(entry => `cb-${entry.name}`))]
    expect(tags.length).toBeGreaterThan(90)
    const failures = await page.evaluate(async tags => {
        // An unstyled shadow boundary excludes any page/Storybook reset.
        const container = document.createElement('div')
        document.body.append(container)
        const scope = container.attachShadow({ mode: 'open' })
        const hosts = tags.map(tag => {
            const host = document.createElement(tag)
            host.setAttribute('accessible-label', tag)
            scope.append(host)
            return host
        })
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        const failures: string[] = []
        for (const host of hosts) {
            if (!customElements.get(host.localName)) failures.push(`${host.localName}: not registered`)
            const elements = [host, ...Array.from(host.shadowRoot?.querySelectorAll('*') ?? [])]
            for (const element of elements) {
                for (const pseudo of [null, '::before', '::after']) {
                    const sizing = getComputedStyle(element, pseudo).boxSizing
                    if (sizing !== 'border-box') failures.push(`${host.localName} ${element.localName}${pseudo ?? ''}: ${sizing}`)
                }
            }
        }
        return failures
    }, tags)
    expect(failures).toEqual([])
})

test('standalone host width includes its padding and borders without app CSS', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-artboard')))
    const sizes = await page.evaluate(async () => {
        const container = document.createElement('div')
        document.body.append(container)
        const scope = container.attachShadow({ mode: 'open' })
        const tags = ['cb-artboard', 'cb-viewport', 'cb-card', 'cb-list', 'cb-box', 'cb-row', 'cb-col', 'cb-grid']
        const hosts = tags.map(tag => {
            const host = document.createElement(tag)
            host.setAttribute('accessible-label', tag)
            host.style.cssText = 'width:200px;padding:10px;border:3px solid'
            scope.append(host)
            return host
        })
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        return hosts.map(host => ({ tag: host.localName, width: host.getBoundingClientRect().width }))
    })
    for (const size of sizes) expect(size.width, size.tag).toBe(200)
})
