import { expect } from '@playwright/test'
import type { Textarea } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-textarea', 'form--textarea', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {
        value: 'Release body', rows: 5, maxRows: 8, minLength: 4,
        maxLength: 500, autocomplete: 'off'
    } satisfies Partial<Textarea>) })
    const textarea = host.locator('textarea').first()
    await expect(textarea).toHaveValue('Release body')
    await expect(textarea).toHaveAttribute('rows', '5')
    await expect(textarea).toHaveAttribute('minlength', '4')
    await expect(textarea).toHaveAttribute('maxlength', '500')
    await expect(textarea).toHaveAttribute('autocomplete', 'off')
    await expect(textarea).toHaveAttribute('style', /--cb-textarea-max-rows:8/)

    const fiveRowHeight = (await textarea.boundingBox())?.height ?? 0
    await host.evaluate(node => {
        ;(node as Textarea).rows = 1
    })
    await expect(textarea).toHaveAttribute('rows', '1')
    await expect
        .poll(async () => (await textarea.boundingBox())?.height ?? 0)
        .toBeLessThan(fiveRowHeight)
})
