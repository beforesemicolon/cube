import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-approval')))
})

test('every Studio design entry registers and mounts without missing-property failures', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))
    const result = await page.evaluate(async () => {
        const { studioDefinitions } = await import('/components/studio/catalog.ts')
        const fixture = document.querySelector<HTMLElement>('#fixture')!
        const componentErrors: string[] = []
        fixture.addEventListener('cb-error', event => componentErrors.push((event as CustomEvent<{ code?: string }>).detail.code ?? 'error'))
        for (const definition of studioDefinitions) {
            const element = document.createElement(`cb-${definition.name}`) as HTMLElement & {
                label: string
                accessibleLabel: string
                value: string | number
                progress: number
                items: ReadonlyArray<{ id: string; label: string }>
            }
            element.label = definition.title
            element.accessibleLabel = definition.title
            element.value = definition.kind === 'number' || definition.kind === 'range' ? 40 : 'one'
            element.progress = 40
            element.items = [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }]
            fixture.append(element)
        }
        return {
            definitions: studioDefinitions.length,
            registered: studioDefinitions.filter(definition => Boolean(customElements.get(`cb-${definition.name}`))).length,
            mounted: fixture.querySelectorAll(':scope > :not(script)').length,
            componentErrors,
        }
    })
    expect(result.definitions).toBe(195)
    expect(result.registered).toBe(195)
    expect(result.mounted).toBe(195)
    expect(result.componentErrors).toEqual([])
    expect(pageErrors).toEqual([])
})

test('representative Studio controls expose keyboard semantics, parts, theme inheritance and no axe violations', async ({ page }) => {
    await page.evaluate(() => {
        const fixture = document.querySelector<HTMLElement>('#fixture')!
        const text = document.createElement('cb-text-input') as HTMLElement & { label: string; value: string }
        text.label = 'Layer name'; text.value = 'Hero'
        const collection = document.createElement('cb-layer-tree') as HTMLElement & { label: string; items: ReadonlyArray<{ id: string; label: string }> }
        collection.label = 'Layers'; collection.items = [{id:'hero',label:'Hero'},{id:'copy',label:'Copy'}]
        const canvas = document.createElement('cb-artboard') as HTMLElement & { label: string; accessibleLabel: string }
        canvas.label = 'Artboard'; canvas.accessibleLabel = 'Homepage artboard'
        fixture.append(text, collection, canvas)
    })
    const input = page.locator('cb-text-input').locator('[part~="control"]')
    await expect(input).toHaveAttribute('aria-label', 'Layer name')
    await input.fill('Navigation')
    await input.press('Tab')
    await expect(page.locator('cb-text-input')).toHaveJSProperty('value', 'Navigation')

    const treeItems = page.locator('cb-layer-tree').getByRole('treeitem')
    await treeItems.first().focus()
    await page.keyboard.press('ArrowDown')
    await expect(treeItems.nth(1)).toBeFocused()

    const artboard = page.locator('cb-artboard').getByRole('region', { name:'Homepage artboard' })
    await artboard.focus()
    await expect(artboard).toBeFocused()
    await expect(page.locator('cb-artboard').locator('[part~="canvas-marker"]')).toBeVisible()

    const accessibility = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(accessibility.violations).toEqual([])

    await page.locator('#theme').evaluate((element: HTMLElement & { appearance: string }) => { element.appearance = 'dark' })
    await expect(page.locator('cb-artboard').locator('[part~="canvas"]')).toHaveCSS('background-color', 'rgb(40, 46, 50)')
})

test('Studio fields expose invalid and read-only states without throwing or accepting changes', async ({ page }) => {
    await page.evaluate(() => {
        const field = document.createElement('cb-text-input') as HTMLElement & {
            label: string
            value: string
            invalid: boolean
            error: string
            readOnly: boolean
        }
        field.label = 'Page title'
        field.value = 'Homepage'
        field.invalid = true
        field.error = 'Enter a valid page title.'
        field.readOnly = true
        document.querySelector('#fixture')!.append(field)
    })
    const field = page.locator('cb-text-input')
    const input = field.locator('[part~="control"]')
    await expect(field).toHaveAttribute('data-invalid')
    await expect(input).toHaveAttribute('aria-invalid', 'true')
    await expect(input).toHaveAttribute('aria-readonly', 'true')
    await expect(field.getByRole('alert')).toHaveText('Enter a valid page title.')
    await input.evaluate((node: HTMLInputElement) => {
        node.value = 'Changed title'
        node.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await expect(field).toHaveJSProperty('value', 'Homepage')
})

test('code preview uses Highlight.js without interpreting source markup', async ({ page }) => {
    await page.evaluate(() => {
        const preview = document.createElement('cb-code-preview') as HTMLElement & { label:string; code:string; codeLanguage:string }
        preview.label = 'HTML example'
        preview.code = '<cb-button label="Save"></cb-button>'
        preview.codeLanguage = 'html'
        document.querySelector('#fixture')!.append(preview)
    })
    const preview = page.locator('cb-code-preview')
    await expect(preview.locator('[part~="language"]')).toHaveText('html')
    await expect(preview.locator('[part~="code"]')).toContainText('<cb-button label="Save"></cb-button>')
    await expect(preview.locator('[part~="code"] .hljs-tag')).toHaveCount(2)
    await expect(preview.locator('[part~="code"] cb-button')).toHaveCount(0)
    await expect(preview.getByRole('button', { name:'Copy' })).toBeEnabled()
})
