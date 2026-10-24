import { expect, test } from '@playwright/test'
import { componentEntries, componentGroups } from '../../scripts/component-entries.js'

test('an individual module import registers its tag without registering its category', async ({ page }) => {
    await page.goto('/tests/browser/module.html')
    const result = await page.evaluate(async () => {
        const path = '/components/form/text-input/index.ts'
        const component: typeof import('../../components/form/text-input/index.js') = await import(path)
        return {
            text: customElements.get('cb-text-input') === component.TextInput,
            textarea: Boolean(customElements.get('cb-textarea')),
            button: Boolean(customElements.get('cb-button')),
            bfs: Reflect.has(globalThis, 'BFS'),
        }
    })
    expect(result).toEqual({ text: true, textarea: false, button: false, bfs: false })
    await page.evaluate(() => {
        const input = document.createElement('cb-text-input')
        input.setAttribute('label', 'Name')
        document.body.append(input)
    })
    await page.getByRole('textbox', { name: 'Name' }).fill('Import and use')
})

test('data-display no longer exports or registers Description Row', async ({ page }) => {
    await page.goto('/tests/browser/module.html')
    const result = await page.evaluate(async () => {
        const categoryPath = '/components/data-display/index.ts'
        const category: typeof import('../../components/data-display/index.js') = await import(categoryPath)
        return { names: Object.keys(category), registered: Boolean(customElements.get('cb-description-row')), card: Boolean(customElements.get('cb-card')) }
    })
    expect(result.registered).toBe(false)
    expect(result.card).toBe(true)
    expect(result.names).not.toContain('DescriptionRow')
    expect(result.names).not.toContain('DescriptionRowBase')
    expect(result.names).not.toContain('initializeDataDisplay')
})

test('a category module registers synchronously on import without loading other categories', async ({ page }) => {
    await page.goto('/tests/browser/module.html')
    const result = await page.evaluate(async () => {
        const path = '/components/form/index.ts'
        const form: typeof import('../../components/form/index.js') = await import(path)
        return {
            text: customElements.get('cb-text-input') === form.TextInput,
            calendar: customElements.get('cb-calendar') === form.Calendar,
            button: Boolean(customElements.get('cb-button')),
            initialize: 'initializeForm' in form,
            ready: 'ready' in form,
        }
    })
    expect(result).toEqual({ text: true, calendar: true, button: false, initialize: false, ready: false })
})

test('form client registers only form tags and uses the supplied WebComponent runtime', async ({ page }) => {
    await page.goto('/tests/browser/runtime.html')
    await page.evaluate(() => {
        const browser = globalThis as typeof globalThis & { BFS: { WebComponent: typeof import('@beforesemicolon/web-component').WebComponent } }
        const Original = browser.BFS.WebComponent
        // Substituting the constructor proves classes are created from the
        // supplied runtime, rather than importing a second package instance.
        browser.BFS.WebComponent = class SuppliedWebComponent<
            P extends import('@beforesemicolon/web-component').ObjectInterface<P>,
            S extends import('@beforesemicolon/web-component').ObjectInterface<S>,
        > extends Original<P, S> {}
    })
    await page.addScriptTag({ url: '/dist/form-client.js' })
    const registered = await page.evaluate(() => ({
        text: Boolean(customElements.get('cb-text-input')),
        date: Boolean(customElements.get('cb-date-picker')),
        button: Boolean(customElements.get('cb-button')),
        menu: Boolean(customElements.get('cb-menu')),
        media: Boolean(customElements.get('cb-audio-player')),
        injected: customElements.get('cb-text-input')!.prototype instanceof Reflect.get(Reflect.get(globalThis, 'BFS'), 'WebComponent'),
    }))
    expect(registered).toEqual({ text: true, date: true, button: false, menu: false, media: false, injected: true })

    await page.evaluate(() => {
        const form = document.createElement('form')
        const input = document.createElement('cb-text-input') as HTMLElement & { value: string; label: string; name: string }
        Object.assign(input, { label: 'Title', name: 'title', value: 'Initial' })
        form.append(input); document.body.append(form)
    })
    const input = page.getByRole('textbox', { name: 'Title' })
    await input.fill('Live value')
    expect(await page.locator('form').evaluate(form => new FormData(form as HTMLFormElement).get('title'))).toBe('Live value')
    await page.addScriptTag({ url: '/dist/action-client.js' })
    await page.addScriptTag({ url: '/dist/form-client.js' })
    await expect(input).toHaveValue('Live value')
    expect(await page.evaluate(() => Boolean(customElements.get('cb-button')))).toBe(true)

    await page.evaluate(() => {
        const tokens = document.createElement('cb-token-input')
        Object.assign(tokens, { value: [], items: [{ id: 'design', label: 'Design' }, { id: 'system', label: 'System' }] })
        document.body.append(tokens)
    })
    const token = page.locator('cb-token-input cb-button').first()
    await token.evaluate(node => node.setAttribute('data-preserved', 'true'))
    await token.getByRole('button', { name: 'Design', exact: true }).click()
    await expect(token).toHaveAttribute('data-preserved', 'true')
    await expect(token.getByRole('button', { name: 'Design', exact: true })).toBeFocused()
})

test('a client without the WebComponent script fails clearly before registering anything', async ({ page }) => {
    await page.goto('/tests/browser/module.html')
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addScriptTag({ url: '/dist/form-client.js' })
    expect(errors).toEqual(['Load @beforesemicolon/web-component/dist/client.js before a Cube client script.'])
    expect(await page.evaluate(() => Boolean(customElements.get('cb-text-input')))).toBe(false)
})

test('complete client registers the entire catalog synchronously and keeps the runtime external', async ({ page }) => {
    await page.goto('/tests/browser/runtime.html')
    const engine = await page.evaluateHandle(() => Reflect.get(Reflect.get(window, 'BFS'), 'WebComponent'))
    await page.addScriptTag({ url: '/dist/client.js' })
    expect(await page.evaluate(() => ['cb-button', 'cb-text-input', 'cb-menu', 'cb-modal', 'cb-table', 'cb-heading', 'cb-theme-provider'].every(tag => Boolean(customElements.get(tag))))).toBe(true)
    expect(await page.evaluate(value => Reflect.get(Reflect.get(window, 'BFS'), 'WebComponent') === value, engine)).toBe(true)
    expect(await page.evaluate(() => Reflect.has(Reflect.get(Reflect.get(window, 'BFS'), 'CUBE'), 'ready'))).toBe(false)
    const api = await page.evaluate(() => {
        const cube: Record<string, object> = Reflect.get(Reflect.get(window, 'BFS'), 'CUBE')
        return {
            componentClasses: Object.keys(cube).filter(key => {
                const value = cube[key]
                return typeof value === 'function' && value.prototype instanceof HTMLElement
            }),
            modal: typeof cube.showModal,
            flashbar: typeof cube.showFlashbar,
            charts: typeof cube.configureChartEngine,
            button: 'Button' in cube,
            base: 'Component' in cube || 'FormControlBase' in cube,
        }
    })
    expect(api).toEqual({ componentClasses: [], modal: 'function', flashbar: 'function', charts: 'function', button: false, base: false })
    await engine.dispose()
})

for (const category of componentGroups) {
    test(`${category} script defines only its own tags and never exposes component classes`, async ({ page }) => {
        await page.goto('/tests/browser/runtime.html')
        await page.addScriptTag({ url: `/dist/${category}-client.js` })
        const result = await page.evaluate(entries => {
            const cube: Record<string, object> | undefined = Reflect.get(Reflect.get(window, 'BFS'), 'CUBE')
            return {
                registered: entries.filter(entry => customElements.get(`cb-${entry.name}`)).map(entry => entry.path.split('/')[0]),
                componentExports: Object.keys(cube ?? {}).filter(key => {
                    const value = cube?.[key]
                    return typeof value === 'function' && value.prototype instanceof HTMLElement
                }),
            }
        }, componentEntries)
        expect(result.registered.length).toBe(componentEntries.filter(entry => entry.path.startsWith(category + '/')).length)
        expect(new Set(result.registered)).toEqual(new Set([category]))
        expect(result.componentExports).toEqual([])
    })
}

test('public utility APIs work without exported classes and survive overlapping scripts', async ({ page }) => {
    await page.goto('/tests/browser/runtime.html')
    await page.addScriptTag({ url: '/dist/client.js' })
    const id = await page.evaluate(() => {
        type API = Pick<typeof import('../../components/index.js'), 'showModal' | 'hideModal'>
        const browser = globalThis as typeof globalThis & { BFS: { CUBE: API } }
        return browser.BFS.CUBE.showModal({ heading: 'Global API', body: 'No component exports required.' }).id
    })
    await expect(page.getByRole('dialog', { name: 'Global API', exact: true })).toBeVisible()
    const hide = await page.evaluateHandle(() => Reflect.get(Reflect.get(Reflect.get(window, 'BFS'), 'CUBE'), 'hideModal'))
    await page.addScriptTag({ url: '/dist/overlay-client.js' })
    expect(await page.evaluate(previous => Reflect.get(Reflect.get(Reflect.get(window, 'BFS'), 'CUBE'), 'hideModal') === previous, hide)).toBe(true)
    expect(await page.evaluate(id => {
        type API = Pick<typeof import('../../components/index.js'), 'hideModal'>
        const browser = globalThis as typeof globalThis & { BFS: { CUBE: API } }
        return browser.BFS.CUBE.hideModal(id)
    }, id)).toBe(true)
    await expect(page.getByRole('dialog', { name: 'Global API', exact: true })).toHaveCount(0)
    await hide.dispose()
})

test('importing Cube automatically upgrades existing composed markup without an initializer', async ({ page }) => {
    await page.goto('/tests/browser/module.html')
    await page.evaluate(async () => {
        const split = document.createElement('cb-split-button')
        split.setAttribute('label', 'Create')
        split.setAttribute('items', JSON.stringify([{ id: 'page', label: 'Page' }]))
        document.body.append(split)
        const entryPath = '/components/index.ts'
        const cube: typeof import('../../components/index.js') = await import(entryPath)
        if ('initializeCube' in cube || 'loadCategory' in cube || 'ready' in cube) throw new Error('Cube must initialize on import, not expose an asynchronous bootstrap')
        if (customElements.get('cb-split-button') !== cube.SplitButton) throw new Error('Component classes must be available as normal named exports')
    })
    const split = page.locator('cb-split-button')
    await expect(split.getByRole('button')).toHaveCount(2)
    await split.getByRole('button').last().click()
    await expect(split.getByRole('menuitem', { name: 'Page', exact: true })).toBeVisible()
})
