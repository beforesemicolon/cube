import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-flashbar')))
}

test('layout primitives remain wrapper-free and expose semantic divider behavior', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const row = document.createElement('cb-row')
        row.setAttribute('gap', '8px')
        row.append(document.createElement('span'), document.createElement('span'))
        const divider = document.createElement('cb-divider')
        document.querySelector('#fixture')?.append(row, divider)
    })
    const row = page.locator('cb-row')
    await expect(row).toHaveCSS('display', 'flex')
    await expect(row.locator('span')).toHaveCount(2)
    await expect(row.locator('div')).toHaveCount(0)
    await expect(row.locator('slot')).toHaveAttribute('part', 'content')
    await expect(page.locator('cb-divider')).toHaveAttribute('role', 'separator')
    await expect(page.locator('cb-divider')).toHaveAttribute('aria-orientation', 'horizontal')
})
test('modal uses native dialog semantics and reports keyboard dismissal', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const modal = document.createElement('cb-modal') as HTMLElement & {
            heading: string
            description: string
            open: boolean
        }
        modal.heading = 'Create a page'
        modal.description = 'Add a page to this project.'
        modal.append(document.createTextNode('Page settings'))
        document.querySelector('#fixture')?.append(modal)
        modal.open = true
    })
    const dialog = page.getByRole('dialog', { name: 'Create a page' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveCSS('border-top-width', '1px')
    await expect(dialog).toHaveCSS('padding', '0px')
    await dialog.press('Escape')
    await expect(dialog).toBeHidden()
    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('alert dialog confirmation is cancelable and flashbars update in place', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const alert = document.createElement('cb-alert-dialog') as HTMLElement & {
            heading: string
            confirmLabel: string
            open: boolean
        }
        alert.heading = 'Delete this page?'
        alert.confirmLabel = 'Delete page'
        alert.open = true
        alert.addEventListener('cb-before-confirm', event => event.preventDefault())
        document.querySelector('#fixture')?.append(alert)

        const flashbar = document.createElement('cb-flashbar') as HTMLElement & {
            show(message: { id: string; type: string; message: string; duration: number }): string
            updateMessage(id: string, message: { type: string; message: string }): boolean
        }
        document.querySelector('#fixture')?.append(flashbar)
        const id = flashbar.show({ id: 'publish', type: 'loading', message: 'Publishing…', duration: 0 })
        flashbar.updateMessage(id, { type: 'success', message: 'Published' })
    })
    const confirm = page.getByRole('button', { name: 'Delete page' })
    await confirm.click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.locator('cb-flashbar').locator('[part=message]')).toHaveCount(1)
    await expect(page.locator('cb-flashbar')).toContainText('Published')
    await expect(page.locator('cb-flashbar').locator('[part~=message-icon]')).toHaveCSS('width', '18px')
})
