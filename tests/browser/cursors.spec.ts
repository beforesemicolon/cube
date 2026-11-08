import { expect, test, type Page } from '@playwright/test'
import { componentGroups } from '../../scripts/component-entries.js'

interface StoryEntry { id: string; type: string }
interface StoryIndex { entries: Record<string, StoryEntry> }
interface PopupHost extends HTMLElement { open?: boolean; showAt?: (x: number, y: number) => void }

async function cursorFailures(page: Page): Promise<string[]> {
    return page.evaluate(() => {
        const selectors = [
            'button', 'a[href]', 'area[href]', 'summary', 'select', 'label', 'cb-button', 'cb-link',
            'input[type=button]', 'input[type=submit]', 'input[type=reset]', 'input[type=image]',
            'input[type=checkbox]', 'input[type=radio]', 'input[type=range]', 'input[type=color]', 'input[type=file]',
            '[role=button]', '[role=link]', '[role=checkbox]', '[role=radio]', '[role=switch]',
            '[role=tab]', '[role=option]', '[role=menuitem]', '[role=menuitemcheckbox]',
            '[role=menuitemradio]', '[role=treeitem]', 'tr[tabindex="0"]',
        ].join(',')
        const gestures = new Set(['grab', 'grabbing', 'move', 'crosshair', 'ew-resize', 'ns-resize',
            'nwse-resize', 'nesw-resize', 'col-resize', 'row-resize'])
        const failures: string[] = []
        const visit = (root: Document | ShadowRoot): void => {
            for (const node of root.querySelectorAll('*')) {
                if (node.shadowRoot) visit(node.shadowRoot)
                if (!node.matches(selectors) || !node.getClientRects().length) continue
                const style = getComputedStyle(node)
                if (style.pointerEvents === 'none' || style.visibility !== 'visible' || style.opacity === '0' || node.closest('[inert]')) continue
                const disabled = node.matches(':disabled,[aria-disabled=true],[data-disabled],label:has(:disabled)') ||
                    node.closest('[data-disabled]') !== null || root instanceof ShadowRoot && root.host.hasAttribute('data-disabled')
                const valid = disabled ? style.cursor === 'not-allowed' : style.cursor === 'pointer' || gestures.has(style.cursor)
                if (!valid) {
                    const owner = root instanceof ShadowRoot ? root.host.localName : 'story'
                    failures.push(`${owner} ${node.localName}[${node.getAttribute('part') || node.getAttribute('role') || node.getAttribute('type') || ''}]: ${style.cursor}${disabled ? ' (disabled)' : ''}`)
                }
            }
        }
        visit(document)
        return failures
    })
}

for (const category of componentGroups) test(`${category}: clickable Storybook surfaces have pointer cursors and disabled surfaces remain disabled`, async ({ page, request }) => {
    test.setTimeout(90_000)
    const response = await request.get('http://127.0.0.1:6006/index.json')
    const index = await response.json() as StoryIndex
    const stories = Object.values(index.entries).filter(entry => entry.type === 'story' && entry.id.startsWith(`${category}--`))
    expect(stories.length).toBeGreaterThan(0)
    for (const story of stories) {
        await page.goto(`http://127.0.0.1:6006/iframe.html?id=${story.id}&viewMode=story&globals=a11yMode:manual`)
        await expect(page.locator(`cube-story-events[data-story-id="${story.id}"]`)).toHaveCount(1, { timeout: 20_000 })
        await page.waitForFunction(() => Boolean(document.querySelector('cube-story-events')?.firstElementChild))
        expect(await cursorFailures(page), story.id).toEqual([])
        await page.locator('[data-story-component]').evaluateAll(nodes => {
            for (const node of nodes) {
                const popup = node as PopupHost
                if (popup.showAt) popup.showAt(120, 120)
                else if ('open' in popup) popup.open = true
            }
        })
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())))
        expect(await cursorFailures(page), `${story.id} open`).toEqual([])
    }
})

test('disabled controls, text editing and editor gestures retain their distinct cursors', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-artboard')))
    await page.evaluate(() => {
        const fixture = document.querySelector('#fixture')!
        for (const tag of ['cb-checkbox', 'cb-text-input', 'cb-editable-label']) {
            const control = document.createElement(tag)
            control.setAttribute('label', tag)
            control.setAttribute('accessible-label', tag)
            fixture.append(control)
        }
        const artboard = document.createElement('cb-artboard')
        for (const [name, value] of Object.entries({ width: '220', height: '120', selected: 'true', name: 'Document', 'resize-label': 'Resize {handle}' })) artboard.setAttribute(name, value)
        fixture.append(artboard)
    })
    const checkbox = page.locator('cb-checkbox')
    await expect(checkbox.locator('label')).toHaveCSS('cursor', 'pointer')
    await expect(checkbox.locator('input')).toHaveCSS('cursor', 'pointer')
    await checkbox.evaluate(node => node.setAttribute('disabled', ''))
    await expect(checkbox.locator('label')).toHaveCSS('cursor', 'not-allowed')
    await expect(checkbox.locator('input')).toHaveCSS('cursor', 'not-allowed')
    await expect(page.locator('cb-text-input input')).not.toHaveCSS('cursor', 'pointer')
    const label = page.locator('cb-editable-label[accessible-label="cb-editable-label"]')
    await expect(label.locator('[part~=display]')).toHaveCSS('cursor', 'pointer')
    await label.evaluate(node => node.setAttribute('disabled', ''))
    await expect(label.locator('[part~=display]')).toHaveCSS('cursor', 'not-allowed')
    const board = page.locator('cb-artboard')
    await expect(board.locator('[part~=frame]')).toHaveCSS('cursor', 'pointer')
    await expect(board.locator('[part~=handle-e]')).toHaveCSS('cursor', 'ew-resize')
    await expect(board.locator('[part~=handle-s]')).toHaveCSS('cursor', 'ns-resize')
    await expect(board.locator('[part~=handle-se]')).toHaveCSS('cursor', 'nwse-resize')
})
