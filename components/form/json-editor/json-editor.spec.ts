import { expect } from '@playwright/test'
import type { JsonEditor } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-json-editor', 'form--json-editor', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"value":"{\"release\":true}"} satisfies Partial<JsonEditor>) })
    await expect(host.locator("textarea").first()).toHaveValue("{\"release\":true}")
    await host.evaluate(node => { Object.assign(node, { validationIssues: [{ message: 'Release must be false.', path: '/release' }] } satisfies Partial<JsonEditor>) })
    await expect(host.getByRole('status')).toContainText('Release must be false.')
    await host.evaluate(node => { Object.assign(node, { validationIssues: [], errorText: 'Existing error.' } satisfies Partial<JsonEditor>) })
    await expect(host.getByRole('status')).toContainText('Existing error.')
    await host.evaluate(node => { Object.assign(node, { errorText: 'Updated error.' } satisfies Partial<JsonEditor>) })
    await expect(host.getByRole('status')).toContainText('Updated error.')
    await host.evaluate(node => { Object.assign(node, { errorText: '' } satisfies Partial<JsonEditor>) })
    await expect(host.getByRole('status')).toHaveText('Valid JSON')
    await host.evaluate(node => node.setAttribute('error-text', 'Attribute error.'))
    await expect(host.getByRole('status')).toContainText('Attribute error.')
    await host.evaluate(node => node.removeAttribute('error-text'))
    await expect(host.getByRole('status')).toHaveText('Valid JSON')
    const input = host.locator('textarea').first()
    await input.fill('{"release":')
    await expect(host.getByRole('status')).toContainText('JSON')
    await input.fill('{"release":false}')
    await expect(host.getByRole('status')).toHaveText('Valid JSON')
})
