import { expect, test } from '@playwright/test'
import type { List, ListLoadMoreDetail } from '../../components/data-display/list/index.js'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-list')))
})

test('list renders arrays, Sets, Maps and one-shot iterables with the proper index/key', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.evaluate(() => {
        const fixture = document.querySelector('#fixture')!
        const collections = [
            ['First', 'Second'], new Set(['First', 'Second']),
            new Map([['alpha', 'First'], ['beta', 'Second']]),
            (function* () { yield 'First'; yield 'Second' })(),
        ]
        for (const items of collections) {
            const list = document.createElement('cb-list') as List<string, string>
            list.items = items
            list.renderItem = (item, key) => {
                const element = document.createElement('span')
                element.textContent = `${key}: ${item}`
                return element
            }
            fixture.append(list)
        }
    })
    const lists = page.locator('cb-list')
    for (const index of [0, 1, 3]) await expect(lists.nth(index).getByRole('listitem')).toHaveText(['0: First', '1: Second'])
    await expect(lists.nth(2).getByRole('listitem')).toHaveText(['alpha: First', 'beta: Second'])
    // Changing unrelated props must not consume the one-shot iterator again.
    await lists.nth(3).evaluate(node => Object.assign(node, { gap: 12, offset: 20 }))
    await expect(lists.nth(3).getByRole('listitem')).toHaveText(['0: First', '1: Second'])
    expect(errors).toEqual([])
})

test('Markup templates stay reactive and renderer replacement works after mount', async ({ page }) => {
    await page.evaluate(async () => {
        const runtimePath = '/components/core/browser.ts'
        const runtime: typeof import('../../components/core/browser.js') = await import(runtimePath)
        const { html, state } = runtime.browserRuntime()
        const [suffix, setSuffix] = state('initial')
        const list = document.createElement('cb-list') as List<string>
        list.items = ['First', 'Second']
        list.renderItem = (item, index) => html`<span>${index}: ${item} ${suffix}</span>`
        const button = document.createElement('button')
        button.textContent = 'Update state'
        button.onclick = () => setSuffix('updated')
        document.querySelector('#fixture')!.append(list, button)
    })
    const rows = page.locator('cb-list').getByRole('listitem')
    await expect(rows).toHaveText(['0: First initial', '1: Second initial'])
    await page.getByRole('button', { name: 'Update state' }).click()
    await expect(rows).toHaveText(['0: First updated', '1: Second updated'])
    await page.locator('cb-list').evaluate(async node => {
        const runtimePath = '/components/core/browser.ts'
        const runtime: typeof import('../../components/core/browser.js') = await import(runtimePath)
        const { html } = runtime.browserRuntime()
        ;(node as List<string>).renderItem = item => html`<strong>${item}</strong>`
    })
    await expect(rows.locator('strong')).toHaveText(['First', 'Second'])
    await page.locator('cb-list').evaluate(node => { (node as List<string>).renderItem = null })
    await expect(rows).toHaveCount(0)
})

test('object records and arbitrary Map keys retain their identity; iterable objects render too', async ({ page }) => {
    await page.evaluate(() => {
        interface RecordItem { name: string }
        interface RecordKey { id: string }
        const firstKey = { id: 'first-key' }, secondKey = { id: 'second-key' }
        const list = document.createElement('cb-list') as List<RecordItem, RecordKey>
        list.items = new Map([[firstKey, { name: 'First' }], [secondKey, { name: 'Second' }]])
        list.renderItem = (item, key) => {
            const element = document.createElement('span')
            element.textContent = `${typeof key === 'number' ? key : key.id}: ${item.name}`
            return element
        }
        const update = document.createElement('button'); update.textContent = 'Reorder records'
        update.onclick = () => { list.items = new Map([[secondKey, { name: 'Updated' }], [firstKey, { name: 'First' }]]) }
        const iterable = document.createElement('cb-list') as List<RecordItem, RecordKey>
        iterable.items = { [Symbol.iterator]: () => [{ name: 'Iterable' }][Symbol.iterator]() }
        iterable.renderItem = list.renderItem
        document.querySelector('#fixture')!.append(list, update, iterable)
    })
    const lists = page.locator('cb-list')
    await expect(lists.first().getByRole('listitem')).toHaveText(['first-key: First', 'second-key: Second'])
    await expect(lists.last().getByRole('listitem')).toHaveText(['0: Iterable'])
    await page.getByRole('button', { name: 'Reorder records' }).click()
    await expect(lists.first().getByRole('listitem')).toHaveText(['second-key: Updated', 'first-key: First'])
    await lists.first().evaluate(node => { (node as List).items = [] })
    await expect(lists.first().getByRole('listitem')).toHaveCount(0)
})

test('appending items preserves existing Elements and focus without adding selection behavior', async ({ page }) => {
    await page.evaluate(() => {
        const list = document.createElement('cb-list') as List<string>
        list.items = ['First', 'Second']
        list.renderItem = item => {
            const input = document.createElement('input')
            input.setAttribute('aria-label', item)
            input.value = item
            return input
        }
        document.querySelector('#fixture')!.append(list)
    })
    const list = page.locator('cb-list')
    const input = list.getByRole('textbox', { name: 'First' })
    await input.fill('User-owned state')
    await list.evaluate(node => {
        const list = node as List<string>
        list.items = ['First', 'Second', 'Third']
    })
    await expect(list.getByRole('listitem')).toHaveCount(3)
    await expect(input).toHaveValue('User-owned state')
    await expect(input).toBeFocused()
    expect(await list.evaluate(node => ['value', 'multiple', 'emptyLabel'].filter(name => name in node))).toEqual([])
    await expect(list).toHaveCSS('border-top-width', '0px')
    await expect(list).toHaveCSS('padding-top', '0px')
    await expect(list).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
})

for (const orientation of ['vertical', 'horizontal'] as const) {
    test(`${orientation} scroll uses gap/offset and requests once per threshold entry`, async ({ page }) => {
        await page.evaluate(orientation => {
            const list = document.createElement('cb-list') as List<number>
            list.style.cssText = 'width:220px;height:160px'
            list.orientation = orientation
            list.offset = 40
            list.gap = 10
            list.items = Array.from({ length: 10 }, (_, index) => index)
            list.renderItem = item => {
                const element = document.createElement('div')
                element.style.cssText = 'width:100px;height:40px'
                element.textContent = `Item ${item}`
                return element
            }
            const events = document.createElement('output'); events.id = 'events'; events.textContent = '[]'
            const scrolls = document.createElement('output'); scrolls.id = 'scrolls'; scrolls.textContent = '0'
            const requests: ListLoadMoreDetail[] = []
            list.addEventListener('loadmoreitems', event => {
                requests.push((event as CustomEvent<ListLoadMoreDetail>).detail)
                events.textContent = JSON.stringify(requests)
            })
            list.addEventListener('scroll', () => { scrolls.textContent = String(Number(scrolls.textContent) + 1) })
            document.querySelector('#fixture')!.append(list, events, scrolls)
        }, orientation)
        const list = page.locator('cb-list')
        const events = page.locator('#events')
        const requestCount = async (): Promise<number> => {
            const requests: ListLoadMoreDetail[] = JSON.parse(await events.textContent() ?? '[]')
            return requests.length
        }
        await expect(list.getByRole('listitem')).toHaveCount(10)
        await expect(list.locator('[part=items]')).toHaveCSS('gap', '10px')
        await expect(events).toHaveText('[]')
        const scrollToRemaining = async (remaining: number): Promise<void> => {
            const previousScrolls = Number(await page.locator('#scrolls').textContent())
            await list.evaluate((node, remaining) => {
                const list = node as List<number>
                if (list.orientation === 'horizontal') list.scrollLeft = list.scrollWidth - list.clientWidth - remaining
                else list.scrollTop = list.scrollHeight - list.clientHeight - remaining
            }, remaining)
            await expect.poll(async () => Number(await page.locator('#scrolls').textContent())).toBeGreaterThan(previousScrolls)
        }
        await scrollToRemaining(60)
        await expect.poll(() => page.locator('#scrolls').textContent()).not.toBe('0')
        await expect(events).toHaveText('[]')
        await scrollToRemaining(30)
        await expect.poll(requestCount).toBe(1)
        const [detail]: ListLoadMoreDetail[] = JSON.parse(await events.textContent() ?? '[]')
        expect(detail).toMatchObject({ orientation, itemCount: 10, remaining: 30 })
        expect(detail.scrollSize - detail.viewportSize - detail.scrollOffset).toBe(30)
        await scrollToRemaining(0)
        await expect.poll(async () => list.evaluate(node => {
            const list = node as List<number>
            return list.orientation === 'horizontal' ? list.scrollWidth - list.clientWidth - list.scrollLeft : list.scrollHeight - list.clientHeight - list.scrollTop
        })).toBe(0)
        expect(await requestCount()).toBe(1)
        await scrollToRemaining(60)
        await expect.poll(async () => list.evaluate(node => node.scrollTop + node.scrollLeft)).toBe(detail.scrollSize - detail.viewportSize - 60)
        await scrollToRemaining(0)
        await expect.poll(requestCount).toBe(2)
        await list.evaluate(node => { (node as List<number>).items = Array.from({ length: 15 }, (_, index) => index) })
        await expect(list.getByRole('listitem')).toHaveCount(15)
        await scrollToRemaining(0)
        await expect.poll(requestCount).toBe(3)
        await list.evaluate((node, orientation) => Object.assign(node, { gap: '1rem', orientation: orientation === 'vertical' ? 'horizontal' : 'vertical' }), orientation)
        await expect(list.locator('[part=items]')).toHaveCSS('gap', '16px')
        await expect(list.locator('[part=items]')).toHaveCSS('flex-direction', orientation === 'vertical' ? 'row' : 'column')
    })
}

test('offset changes apply immediately without repeated requests while resting at the threshold', async ({ page }) => {
    await page.evaluate(() => {
        const list = document.createElement('cb-list') as List<number>
        list.style.height = '100px'; list.offset = 0
        list.items = [1, 2, 3, 4, 5]
        list.renderItem = item => {
            const row = document.createElement('span'); row.style.cssText = 'display:block;height:40px'; row.textContent = String(item)
            return row
        }
        const output = document.createElement('output'); output.id = 'count'; output.textContent = '0'
        list.addEventListener('loadmoreitems', () => { output.textContent = String(Number(output.textContent) + 1) })
        document.querySelector('#fixture')!.append(list, output)
    })
    const list = page.locator('cb-list')
    await expect(list.getByRole('listitem')).toHaveCount(5)
    await list.evaluate(node => { (node as List).offset = 120 })
    await expect(page.locator('#count')).toHaveText('1')
    await list.evaluate(node => { (node as List).gap = 1 })
    await expect(list.locator('[part=items]')).toHaveCSS('gap', '1px')
    await expect(page.locator('#count')).toHaveText('1')
    await list.evaluate(node => { (node as List).offset = 160 })
    await expect(page.locator('#count')).toHaveText('1')
    await list.evaluate(node => { (node as List).offset = 0 })
    await expect(list).toHaveAttribute('offset', '0')
    await list.evaluate(node => { node.scrollTop = node.scrollHeight })
    await expect(page.locator('#count')).toHaveText('2')
})

test('underfilled lists request more after data arrives and after a resize; reconnect does not duplicate listeners', async ({ page }) => {
    await page.evaluate(() => {
        const list = document.createElement('cb-list') as List<number>
        list.style.cssText = 'width:220px;height:160px'
        list.offset = 0
        list.items = [1]
        list.renderItem = item => {
            const element = document.createElement('div')
            element.style.height = '40px'
            element.textContent = String(item)
            return element
        }
        const output = document.createElement('output'); output.id = 'requests'; output.textContent = '0'
        list.addEventListener('loadmoreitems', () => { output.textContent = String(Number(output.textContent) + 1) })
        document.querySelector('#fixture')!.append(list, output)
    })
    const list = page.locator('cb-list')
    await expect(page.locator('#requests')).toHaveText('1')
    await list.evaluate(node => { (node as List<number>).items = [1, 2] })
    await expect(page.locator('#requests')).toHaveText('2')
    await list.evaluate(node => { (node as List<number>).items = [1, 2, 3, 4, 5] })
    await expect(list.getByRole('listitem')).toHaveCount(5)
    await list.evaluate(node => { (node as HTMLElement).style.height = '240px' })
    await expect(page.locator('#requests')).toHaveText('3')
    await list.evaluate(node => { const parent = node.parentElement!; node.remove(); parent.append(node) })
    await expect(list.getByRole('listitem')).toHaveCount(5)
    await expect(page.locator('#requests')).toHaveText('4')
})

test('default-slot content participates in scrolling and horizontal RTL reaches its end', async ({ page }) => {
    await page.evaluate(() => {
        const list = document.createElement('cb-list') as List
        list.style.cssText = 'width:220px;height:80px'
        list.dir = 'rtl'
        list.orientation = 'horizontal'
        list.gap = 8
        list.offset = 0
        for (const text of ['First', 'Second', 'Third', 'Fourth']) {
            const child = document.createElement('article')
            child.style.width = '100px'; child.textContent = text
            list.append(child)
        }
        const output = document.createElement('output'); output.id = 'detail'; output.textContent = ''
        list.addEventListener('loadmoreitems', event => { output.textContent = JSON.stringify((event as CustomEvent<ListLoadMoreDetail>).detail) })
        document.querySelector('#fixture')!.append(list, output)
    })
    const list = page.locator('cb-list')
    await expect(list.locator('article')).toHaveCount(4)
    await expect(page.locator('#detail')).toHaveText('')
    await list.evaluate(node => { node.scrollLeft = -node.scrollWidth })
    await expect.poll(async () => page.locator('#detail').textContent()).not.toBe('')
    const detail: ListLoadMoreDetail = JSON.parse(await page.locator('#detail').textContent() ?? '{}')
    expect(detail).toMatchObject({ orientation: 'horizontal', remaining: 0 })
    expect(detail.scrollOffset).toBeGreaterThan(0)
    await expect(list.locator('[part=item]')).toHaveCount(0)
})

for (const delayed of [false, true]) {
    test(`Storybook List is unstyled and live controls affect gap and direction${delayed ? ' after a delayed story load' : ''}`, async ({ page }) => {
        let storyRequestDelayed = false
        if (delayed) {
            await page.route(url => /\/(?:stories|assets)\/data-display\.stories(?:\.ts|-[^/]+\.js)$/.test(url.pathname), async route => {
                // Model a cold story import that outlasts ordinary value assertions.
                storyRequestDelayed = true
                await new Promise<void>(resolve => setTimeout(resolve, 6_000))
                await route.continue()
            })
        }
        await page.goto('http://127.0.0.1:6006/?path=/story/data-display--list')
        const list = page.frameLocator('#storybook-preview-iframe').locator('cb-list[data-story-component]')
        // Storybook bootstrapping gets its own budget; value checks stay strict.
        await expect(list).toBeVisible({ timeout: 20_000 })
        expect(storyRequestDelayed).toBe(delayed)
        await expect(list.getByRole('listitem')).toHaveCount(20)
        await expect(page.getByRole('tabpanel', { name: /Controls/ })).toContainText('renderItem', { timeout: 20_000 })
        for (const prop of ['value', 'multiple', 'emptyLabel']) await expect(page.locator(`#control-${prop}`)).toHaveCount(0)
        await page.locator('#control-gap').fill('20px'); await page.locator('#control-gap').press('Tab')
        await expect(list.locator('[part=items]')).toHaveCSS('gap', '20px')
        await page.locator('#control-orientation').selectOption('horizontal')
        await expect(list.locator('[part=items]')).toHaveCSS('flex-direction', 'row')
        await expect(list).toHaveCSS('border-top-width', '0px')
        await page.getByRole('tab', { name: /Actions/ }).click()
        await list.evaluate(node => { node.scrollLeft = node.scrollWidth })
        const actions = page.getByRole('tabpanel', { name: /Actions/ })
        await expect(actions).toContainText('loadmoreitems')
        await expect(actions).toContainText('scroll:')
        await expect(actions).not.toContainText('action:')
    })
}

test('Infinite list example appends batches through the public event API', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--infinite-list&viewMode=story')
    const list = page.locator('cb-list')
    await expect(list.getByRole('listitem')).toHaveCount(20)
    await list.evaluate(node => { node.scrollTop = node.scrollHeight })
    await expect(list.getByRole('listitem')).toHaveCount(40)
    await list.evaluate(node => { node.scrollTop = node.scrollHeight })
    await expect(list.getByRole('listitem')).toHaveCount(60)
})
