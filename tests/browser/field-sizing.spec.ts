import { expect, test } from '@playwright/test'

test('textual controls share padding and single-row height, including custom spacing', async ({ page }) => {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-linked-values')))
    await page.evaluate(() => {
        const fixture = document.querySelector('#fixture')
        if (!fixture) throw new Error('Missing fixture')
        const definitions = [
            ['cb-text-input', { value: 'Text' }],
            ['cb-number-input', { value: 12 }],
            ['cb-textarea', { value: 'Text', rows: 1 }],
            ['cb-select', { value: 'one', options: [{ value: 'one', label: 'One' }] }],
            ['cb-rich-text-editor', { value: 'Text', variant: 'inline' }],
            ['cb-unit-input', { value: 12, unit: 'px', units: [{ value: 'px', label: 'px' }, { value: 'em', label: 'em' }] }],
            ['cb-combobox', { value: 'one', options: [{ value: 'one', label: 'One' }] }],
            ['cb-token-input', { items: [{ id: 'one', label: 'One' }], value: ['one'] }],
            ['cb-masked-input', { value: '123', mask: '###' }],
            ['cb-linked-values', { values: '12,24', fieldLabels: 'Width,Height' }],
        ] as const
        for (const [tag, props] of definitions) {
            const control = document.createElement(tag)
            Object.assign(control, props, { accessibleLabel: tag })
            control.style.setProperty('--component-studio-control-min-width', '0px')
            fixture.append(control)
        }
        const combo = document.createElement('cb-combobox')
        combo.id = 'multi-combo'
        Object.assign(combo, { multi: true, value: ['one'], options: [{ value: 'one', label: 'One' }], accessibleLabel: 'Multiple colors' })
        fixture.append(combo)
    })
    const controls = [
        ['cb-text-input', 'input[part~=control]', 'input[part~=control]'],
        ['cb-number-input', 'input[part~=control]', 'input[part~=control]'],
        ['cb-textarea', 'textarea', 'textarea'],
        ['cb-select', 'cb-button[part~=trigger]', 'cb-button[part~=trigger] [part~=control]'],
        ['cb-rich-text-editor', '[part~=shell]', '[contenteditable]'],
        ['cb-unit-input', '[part~=field-shell]', 'input[part~=control]'],
        ['cb-combobox:not(#multi-combo)', '[part~=input-shell]', 'input[part~=input]'],
        ['cb-token-input', '[part~=token-list]', '[part~=token-list]'],
        ['cb-masked-input', 'input[part~=input]', 'input[part~=input]'],
        ['cb-linked-values', 'cb-number-input input[part~=control]', 'cb-number-input input[part~=control]'],
        ['#multi-combo', '[part~=input-shell]', '[part~=values]'],
    ] as const
    for (const size of ['xs', 'sm', 'md', 'lg']) {
        await page.locator('#fixture').evaluate((fixture, size) => {
            for (const node of fixture.children) node.setAttribute('size', size)
        }, size)
        for (const custom of [false, true]) {
            await page.locator('#fixture').evaluate((fixture, custom) => {
                if (!(fixture instanceof HTMLElement)) throw new Error('Expected an HTML fixture')
                for (const name of ['--component-field-padding-inline', '--component-field-padding-block']) {
                    if (!custom) fixture.style.removeProperty(name)
                }
                if (custom) {
                    fixture.style.setProperty('--component-field-padding-inline', '18px')
                    fixture.style.setProperty('--component-field-padding-block', '8px')
                }
            }, custom)
            const reference = await page.locator('cb-text-input input[part~=control]').evaluate(node => node.getBoundingClientRect().height)
            for (const [tag, shell, padded] of controls) {
                const host = page.locator(tag)
                await expect(host.locator(padded).first(), `${tag} inline padding`).toHaveCSS('padding-inline-start', custom ? '18px' : '14px')
                await expect(host.locator(padded).first(), `${tag} block padding`).toHaveCSS('padding-block-start', custom ? '8px' : '6px')
                await expect.poll(() => host.locator(shell).first().evaluate(node => node.getBoundingClientRect().height), `${tag} matches text input (${size})`).toBeCloseTo(reference, 1)
            }
        }
    }
})
