import { expect, test, type Page } from '@playwright/test'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-theme-provider')))
}

test('Description Row is absent from Storybook and asset examples use native metadata', async ({ page }) => {
    const response = await page.request.get('http://127.0.0.1:6006/index.json')
    const catalog: { entries: Record<string, { id: string }> } = await response.json()
    expect(catalog.entries['data-display--description-row']).toBeUndefined()
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--asset-browser&viewMode=story')
    await expect(page.locator('cb-card')).toHaveCount(3)
    await expect(page.locator('cb-card dl dt')).toHaveText(['Format','Format','Format'])
    await expect(page.locator('cb-card dl dd')).toHaveText(['1920 × 1080','SVG','800 × 800'])
    await expect(page.locator('cb-description-row')).toHaveCount(0)
})

test('Card story exposes live Box-family controls without generated card content', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/?path=/story/data-display--card')
    const card = page.frameLocator('#storybook-preview-iframe').locator('cb-card[data-story-component]')
    await expect(card.getByText('Place any content here.')).toBeVisible()
    await page.locator('#control-padding').fill('32px')
    await page.locator('#control-padding').press('Tab')
    await expect(card).toHaveCSS('padding-top','32px')
    await expect(page.locator('#control-width')).toHaveValue('320px')
    await page.locator('#control-width').fill('250px')
    await page.locator('#control-width').press('Tab')
    await expect(card).toHaveCSS('width','250px')
    for (const prop of ['value','items','actionLabel']) await expect(page.locator(`#control-${prop}`)).toHaveCount(0)
    await expect(card.locator('[part~=panel-header], [part~=generated-content], cb-button')).toHaveCount(0)
})

test('Feedback contains exactly one prop-driven story per component; variants live in Examples', async ({ page }) => {
    const response = await page.request.get('http://127.0.0.1:6006/index.json')
    const catalog: { entries: Record<string, { id: string; type: string }> } = await response.json()
    expect(Object.values(catalog.entries).filter(entry => entry.type === 'story' && entry.id.startsWith('feedback--')).map(entry => entry.id).sort()).toEqual(
        ['alert','banner','empty-state','flashbar','progress','skeleton','spinner','status','toast'].map(name => `feedback--${name}`).sort(),
    )
    await page.goto('http://127.0.0.1:6006/iframe.html?id=examples--feedback-variants&viewMode=story')
    const scope = page.locator('cube-story-events[data-story-id="examples--feedback-variants"]')
    await expect(scope.locator('cb-progress')).toHaveCount(3)
    await expect(scope.locator('cb-progress progress').first()).not.toHaveAttribute('value')
    await expect(scope.locator('cb-alert')).toHaveCount(2)
    await expect(scope.locator('cb-skeleton [part~=media]')).toBeVisible()
    await expect(scope.locator('cb-skeleton [part~=cell]')).toHaveCount(9)
    await expect(scope.locator('cb-spinner [part~=spinner-ring]')).toHaveCSS('width','16px')
    await expect(scope.getByRole('button', { name: 'Retry' })).toBeVisible()
})

test('Empty State has one story with heading and icon props, not message variants', async ({ page }) => {
    const response = await page.request.get('http://127.0.0.1:6006/index.json')
    const catalog: { entries: Record<string, { id: string; type: string }> } = await response.json()
    expect(Object.values(catalog.entries).filter(entry => entry.type === 'story' && entry.id.startsWith('feedback--empty-state')).map(entry => entry.id)).toEqual(['feedback--empty-state'])
    await page.goto('http://127.0.0.1:6006/?path=/story/feedback--empty-state')
    const empty = page.frameLocator('#storybook-preview-iframe').locator('cb-empty-state[data-story-component]')
    await page.locator('#control-heading').fill('A custom empty state')
    await page.locator('#control-heading').press('Tab')
    await expect(empty.getByRole('heading', { name: 'A custom empty state' })).toBeVisible()
    await page.locator('#control-icon').selectOption('search')
    await expect(empty.locator('cb-row[part=icon-box] > cb-icon')).toHaveAttribute('name','search')
    expect(await empty.evaluate(node => ['value', 'status', 'tone'].filter(prop => prop in node))).toEqual([])
    for (const prop of ['value', 'status', 'tone']) await expect(page.locator(`#control-${prop}`)).toHaveCount(0)
})

test('Skeleton Storybook controls update the applicable text, table and card variants', async ({ page }) => {
    await page.goto('http://127.0.0.1:6006/?path=/story/feedback--skeleton')
    const skeleton = page.frameLocator('#storybook-preview-iframe').locator('cb-skeleton[data-story-component]')
    await expect(skeleton.locator('[part~=line]')).toHaveCount(3)
    await expect(page.locator('#control-rows')).toHaveCount(0)
    await expect(page.locator('#control-columns')).toHaveCount(0)
    await page.locator('#control-lines').fill('5')
    await page.locator('#control-lines').press('Tab')
    await expect(skeleton.locator('[part~=line]')).toHaveCount(5)

    await page.locator('#control-variant').selectOption('table')
    await expect(page.locator('#control-lines')).toHaveCount(0)
    await page.locator('#control-rows').fill('4')
    await page.locator('#control-rows').press('Tab')
    await page.locator('#control-columns').fill('2')
    await page.locator('#control-columns').press('Tab')
    await expect(skeleton.locator('[part~=row]')).toHaveCount(4)
    await expect(skeleton.locator('[part~=cell]')).toHaveCount(8)
    await expect(skeleton.locator('[part~=row]').first()).toHaveCSS('grid-template-columns', /\d+px \d+px/)
    await page.locator('#control-columns').fill('5')
    await page.locator('#control-columns').press('Tab')
    await expect(skeleton.locator('[part~=cell]')).toHaveCount(20)

    await page.locator('#control-variant').selectOption('card')
    await expect(page.locator('#control-rows')).toHaveCount(0)
    await expect(page.locator('#control-columns')).toHaveCount(0)
    await expect(skeleton.locator('[part~=media]')).toBeVisible()
    await page.locator('#control-lines').fill('2')
    await page.locator('#control-lines').press('Tab')
    await expect(skeleton.locator('[part~=line]')).toHaveCount(2)
})

test('every public component exposes controls and initialized args for every reactive prop', async ({ page }) => {
    await start(page)
    const audit = await page.evaluate(async () => {
        const { controlsFor, storyArgsFor } = await import('../../stories/controls.js')
        const { componentEntries } = await import('../../scripts/component-entries.js')
        interface ObservedConstructor extends CustomElementConstructor { readonly observedAttributes?: readonly string[] }
        const missingControls: string[] = []
        const missingArgs: string[] = []
        for (const entry of componentEntries) {
            const tag = `cb-${entry.name}`
            const constructor = customElements.get(tag) as ObservedConstructor | undefined
            if (!constructor) { missingControls.push(`${tag}:registration`); continue }
            const controls = controlsFor(tag)
            const args = storyArgsFor(tag, {})
            for (const attribute of constructor.observedAttributes ?? []) {
                const property = attribute.replace(/-([a-z])/g, (_match: string, letter: string) => letter.toUpperCase())
                if (!(property in controls)) missingControls.push(`${tag}:${property}`)
                if (!(property in args)) missingArgs.push(`${tag}:${property}`)
            }
        }
        const splitControls = controlsFor('cb-split-button')
        const splitArgs = storyArgsFor('cb-split-button', { items: [{ id: 'save', label: 'Save' }] })
        const maskedControls = controlsFor('cb-masked-input')
        const maskedArgs = storyArgsFor('cb-masked-input', {})
        const cardControls = controlsFor('cb-card')
        const badgeControls = controlsFor('cb-badge')
        const comboboxControls = controlsFor('cb-combobox')
        const fieldProperties = ['helpText', 'details', 'detailsLabel', 'optionalLabel', 'invalid', 'success', 'successText']
        return {
            missingControls,
            missingArgs,
            splitItemControl: splitControls.items?.control,
            splitItems: splitArgs.items,
            missingMaskedFieldControls: fieldProperties.filter(property => !(property in maskedControls)),
            missingMaskedFieldArgs: fieldProperties.filter(property => !(property in maskedArgs)),
            cardProperties: Object.keys(cardControls),
            boxProperties: Object.keys(controlsFor('cb-box')),
            cardCategories: Object.fromEntries(Object.entries(cardControls).map(([property, definition]) => [property, definition.table.category])),
            badgeHasStatus: 'status' in badgeControls,
            comboboxProperties: Object.keys(comboboxControls),
            comboboxCategories: Object.fromEntries(Object.entries(comboboxControls).map(([property, definition]) => [property, definition.table.category])),
        }
    })
    expect(audit.missingControls).toEqual([])
    expect(audit.missingArgs).toEqual([])
    expect(audit.splitItemControl).toBe('object')
    expect(audit.splitItems).toEqual([{ id: 'save', label: 'Save' }])
    expect(audit.missingMaskedFieldControls).toEqual([])
    expect(audit.missingMaskedFieldArgs).toEqual([])
    expect(audit.cardProperties).toEqual(audit.boxProperties)
    for (const prop of ['value', 'items', 'actionLabel']) expect(audit.cardProperties).not.toContain(prop)
    expect(audit.cardCategories.padding).toBe('Box family')
    expect(audit.cardCategories.label).toBe('Component')
    expect(audit.cardProperties.indexOf('padding')).toBeLessThan(audit.cardProperties.indexOf('label'))
    expect(audit.badgeHasStatus).toBe(false)
    expect(audit.comboboxCategories.name).toBe('Form Control family')
    expect(audit.comboboxCategories.helpText).toBe('Field wrapper')
    expect(audit.comboboxCategories.label).toBe('Component')
    expect(audit.comboboxProperties.indexOf('options')).toBeLessThan(audit.comboboxProperties.indexOf('name'))
    expect(audit.comboboxProperties.indexOf('name')).toBeLessThan(audit.comboboxProperties.indexOf('helpText'))
    expect(audit.comboboxProperties.indexOf('helpText')).toBeLessThan(audit.comboboxProperties.indexOf('label'))
})
