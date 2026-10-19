import { expect, test } from '@playwright/test'

test('form client registers only form tags and uses the supplied WebComponent runtime', async ({ page }) => {
    await page.goto('/tests/browser/runtime.html')
    await page.addScriptTag({ url: '/dist/form-client.js' })
    const registered = await page.evaluate(() => ({
        text: Boolean(customElements.get('cb-text-input')),
        date: Boolean(customElements.get('cb-date-picker')),
        button: Boolean(customElements.get('cb-button')),
        menu: Boolean(customElements.get('cb-menu')),
        media: Boolean(customElements.get('cb-audio-player')),
    }))
    expect(registered).toEqual({ text: true, date: true, button: false, menu: false, media: false })

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

test('complete client registers the entire catalog synchronously and keeps the runtime external', async ({ page }) => {
    await page.goto('/tests/browser/runtime.html')
    const engine = await page.evaluateHandle(() => Reflect.get(Reflect.get(window, 'BFS'), 'WebComponent'))
    await page.addScriptTag({ url: '/dist/client.js' })
    expect(await page.evaluate(() => ['cb-button', 'cb-text-input', 'cb-menu', 'cb-modal', 'cb-table', 'cb-heading', 'cb-theme-provider'].every(tag => Boolean(customElements.get(tag))))).toBe(true)
    expect(await page.evaluate(value => Reflect.get(Reflect.get(window, 'BFS'), 'WebComponent') === value, engine)).toBe(true)
    await engine.dispose()
})

test('module initialization upgrades existing composed markup with the injected runtime', async ({ page }) => {
    await page.goto('/tests/browser/runtime.html')
    await page.evaluate(async () => {
        const split = document.createElement('cb-split-button')
        split.setAttribute('label', 'Create')
        split.setAttribute('items', JSON.stringify([{ id: 'page', label: 'Page' }]))
        document.body.append(split)
        const initializationPath = '/components/initialize.ts'
        const runtimePath = '/components/core/runtime.ts'
        const initialization: typeof import('../../components/initialize.js') = await import(initializationPath)
        const runtime: typeof import('../../components/core/runtime.js') = await import(runtimePath)
        await initialization.initializeCube(runtime.browserRuntime())
    })
    const split = page.locator('cb-split-button')
    await expect(split.getByRole('button')).toHaveCount(2)
    await split.getByRole('button').last().click()
    await expect(split.getByRole('menuitem', { name: 'Page', exact: true })).toBeVisible()
})
