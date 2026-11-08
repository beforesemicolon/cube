import { expect } from '@playwright/test'
import type { EditableList } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-editable-list', 'form--editable-list', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"items":[{"id":"release","label":"Release item","value":"release"}]} satisfies Partial<EditableList>) })
    await expect(host.locator("[part=item-label]")).toHaveText("Release item")
    await host.evaluate(node => {
        Object.assign(node, {
            controlled: true,
            draftValue: 'Next item',
            variant: 'chips',
            minItems: 0,
            adding: false,
            loading: false,
            items: [
                {
                    id: 'release',
                    label: 'Release item',
                    value: 'release',
                    removeLabel: 'Remove release item',
                },
            ],
        } satisfies Partial<EditableList>)
        node.addEventListener('input', event => {
            if (event instanceof CustomEvent)
                node.dataset.inputValue = event.detail.value
        })
        node.addEventListener('add', event => {
            if (event instanceof CustomEvent)
                node.dataset.addValue = event.detail.value
        })
        node.addEventListener('remove', event => {
            if (event instanceof CustomEvent)
                node.dataset.removeId = event.detail.id
        })
        const action = document.createElement('button')
        action.slot = 'item-actions-release'
        action.textContent = 'Inspect'
        node.append(action)
    })
    await expect(host).toHaveAttribute('data-variant', 'chips')
    expect(
        await host.evaluate((node) => {
            const list = node as EditableList
            return {
                disabled: list.disabled,
                readOnly: list.readOnly,
                adding: list.adding,
                loading: list.loading,
                controlled: list.controlled,
                draftValue: list.draftValue,
            }
        })
    ).toEqual({
        disabled: false,
        readOnly: false,
        adding: false,
        loading: false,
        controlled: true,
        draftValue: 'Next item',
    })
    await expect(host.getByRole('button', { name: 'Inspect' })).toBeVisible()
    await host.getByRole('textbox').fill('Updated draft')
    await expect(host).toHaveAttribute('data-input-value', 'Updated draft')
    await host.evaluate(node => {
        ;(node as EditableList).draftValue = 'Updated draft'
    })
    await host.getByRole('button', { name: 'Add path' }).click()
    await expect(host).toHaveAttribute('data-add-value', 'Updated draft')
    await host.getByRole('button', { name: 'Remove release item' }).click()
    await expect(host).toHaveAttribute('data-remove-id', 'release')
    await expect(host.locator('[part=item]')).toHaveCount(1)
})
