import { expect, test, type Page } from '@playwright/test'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-theme-provider')))
}

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
        const fieldProperties = ['helpText', 'details', 'detailsLabel', 'optionalLabel', 'invalid', 'success', 'successText']
        return {
            missingControls,
            missingArgs,
            splitItemControl: splitControls.items?.control,
            splitItems: splitArgs.items,
            missingMaskedFieldControls: fieldProperties.filter(property => !(property in maskedControls)),
            missingMaskedFieldArgs: fieldProperties.filter(property => !(property in maskedArgs)),
            cardProperties: Object.keys(cardControls),
            cardCategories: Object.fromEntries(Object.entries(cardControls).map(([property, definition]) => [property, definition.table.category])),
            badgeHasStatus: 'status' in badgeControls,
        }
    })
    expect(audit.missingControls).toEqual([])
    expect(audit.missingArgs).toEqual([])
    expect(audit.splitItemControl).toBe('object')
    expect(audit.splitItems).toEqual([{ id: 'save', label: 'Save' }])
    expect(audit.missingMaskedFieldControls).toEqual([])
    expect(audit.missingMaskedFieldArgs).toEqual([])
    expect(audit.cardProperties).toEqual(['value', 'items', 'actionLabel', 'label', 'accessibleLabel', 'description', 'disabled', 'size'])
    expect(audit.cardCategories).toEqual({
        value: 'Card',
        items: 'Card',
        actionLabel: 'Card',
        label: 'Component',
        accessibleLabel: 'Component',
        description: 'Component',
        disabled: 'Component',
        size: 'Component',
    })
    expect(audit.badgeHasStatus).toBe(false)
})
