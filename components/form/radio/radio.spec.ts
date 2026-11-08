import { expect } from '@playwright/test'
import { componentContract } from '../../../tests/component-contract.js'
import type { Radio } from './index.js'

componentContract('cb-radio', 'form--radio', async ({ page, host }) => {
    await host.evaluate(node => {
        Object.assign(node, {
            checked: false,
            description: 'Use this row in the report.',
            name: 'report-row',
            value: 'row-1',
        } satisfies Partial<Radio>)
        node.addEventListener('change', event => {
            const detail = (
                event as CustomEvent<{
                    checked: boolean
                    value: boolean
                    previousValue: boolean
                }>
            ).detail
            node.dataset.changeDetail = JSON.stringify({
                checked: detail.checked,
                value: detail.value,
                previousValue: detail.previousValue,
            })
        })
    })

    const radio = host.getByRole('radio', { name: 'Radio', exact: true })
    await expect(radio).not.toBeChecked()
    await expect(host.locator('[part~=choice-description]')).toHaveText(
        'Use this row in the report.'
    )

    await page.evaluate(() => {
        const second = document.createElement('cb-radio') as Radio
        Object.assign(second, {
            checked: false,
            label: 'Second row',
            name: 'report-row',
            value: 'row-2',
        } satisfies Partial<Radio>)
        document.body.append(second)
    })

    await radio.click()
    await expect(host).toHaveJSProperty('checked', true)
    await expect(host).toHaveAttribute(
        'data-change-detail',
        JSON.stringify({ checked: true, value: true, previousValue: false })
    )
    await page.getByRole('radio', { name: 'Second row', exact: true }).click()
    await expect(host).toHaveJSProperty('checked', false)

    await host.evaluate(node => {
        Object.assign(node, {
            accessibleLabel: 'Select row',
            description: '',
            label: '',
        } satisfies Partial<Radio>)
    })
    await expect(host.getByRole('radio', { name: 'Select row' })).toBeVisible()
    await expect(host.locator('[part~=choice-copy]')).toBeHidden()
})
