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
        const grid = document.createElement('cb-grid') as HTMLElement & { gap: string; columnGap: string }
        Object.assign(grid, { gap: '12px', columnGap: '20px' })
        grid.append(document.createElement('span'), document.createElement('span'))
        const divider = document.createElement('cb-divider')
        document.querySelector('#fixture')?.append(row, grid, divider)
    })
    const row = page.locator('cb-row')
    await expect(row).toHaveCSS('display', 'flex')
    await expect(row.locator('span')).toHaveCount(2)
    await expect(row.locator('div')).toHaveCount(0)
    await expect(row.locator('slot')).toHaveAttribute('part', 'content')
    const grid = page.locator('cb-grid')
    await expect(grid).toHaveCSS('column-gap', '20px')
    await expect(grid).toHaveCSS('row-gap', '12px')
    await grid.evaluate((element: HTMLElement & { columnGap: string }) => { element.columnGap = '' })
    await expect(grid).toHaveCSS('column-gap', '12px')
    await expect(grid).toHaveCSS('row-gap', '12px')
    await expect(page.locator('cb-divider')).toHaveAttribute('role', 'separator')
    await expect(page.locator('cb-divider')).toHaveAttribute('aria-orientation', 'horizontal')
})

test('panel components expose real disclosure and keyboard resize behavior', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const sidebar = document.createElement('cb-sidebar') as HTMLElement & { label: string; collapsible: boolean; expanded: boolean; expandLabel: string; collapseLabel: string }
        Object.assign(sidebar, { label: 'Layers', collapsible: true, expanded: true, expandLabel: 'Expand layers', collapseLabel: 'Collapse layers' })
        sidebar.append(document.createTextNode('Layer list'))
        const fixedSidebar = document.createElement('cb-sidebar') as HTMLElement & { label: string; collapsible: boolean; expanded: boolean }
        Object.assign(fixedSidebar, { label: 'Navigation', collapsible: false, expanded: false })
        fixedSidebar.append(document.createTextNode('Permanent navigation'))
        const resizable = document.createElement('cb-resizable-panel') as HTMLElement & { label: string; value: number; min: number; max: number; step: number; resizeLabel: string }
        Object.assign(resizable, { label: 'Properties', value: 320, min: 240, max: 400, step: 20, resizeLabel: 'Resize properties' })
        resizable.append(document.createTextNode('Property list'))
        const docked = document.createElement('cb-docked-panel') as HTMLElement & { label: string; expanded: boolean; collapsible: boolean; expandLabel: string; collapseLabel: string }
        Object.assign(docked, { label: 'Inspector', expanded: true, collapsible: true, expandLabel: 'Expand inspector', collapseLabel: 'Collapse inspector' })
        docked.append(document.createTextNode('Inspector content'))
        document.querySelector('#fixture')?.append(sidebar, fixedSidebar, resizable, docked)
    })
    const sidebar = page.locator('cb-sidebar').first()
    await sidebar.getByRole('button', { name: 'Collapse layers' }).click()
    await expect(sidebar).not.toHaveAttribute('expanded', '')
    await expect(sidebar).toHaveAttribute('data-collapsed', '')
    await expect(sidebar).toHaveCSS('width', '48px')
    await expect(sidebar.locator('div[part=content]')).toBeHidden()
    await expect(sidebar.locator('cb-panel-header [part~=heading]')).toBeEmpty()
    await expect(sidebar.getByRole('button', { name: 'Expand layers' })).toBeVisible()
    const collapsedGeometry = await sidebar.locator('aside[part~=sidebar]').evaluate(element => ({ width: element.getBoundingClientRect().width, scrollWidth: element.scrollWidth }))
    expect(collapsedGeometry.scrollWidth).toBeLessThanOrEqual(Math.ceil(collapsedGeometry.width))
    await sidebar.evaluate((element: HTMLElement & { collapsible: boolean }) => { element.collapsible = false })
    await expect(sidebar).not.toHaveAttribute('collapsible')
    await expect(sidebar).not.toHaveAttribute('data-collapsed')
    await expect(sidebar).toHaveCSS('width', '280px')
    await expect(sidebar.getByText('Layer list')).toBeVisible()
    await expect(sidebar.getByRole('button')).toHaveCount(0)
    const fixedSidebar = page.locator('cb-sidebar').nth(1)
    await expect(fixedSidebar.getByText('Permanent navigation')).toBeVisible()
    await expect(fixedSidebar.getByRole('button')).toHaveCount(0)
    const separator = page.getByRole('separator', { name: 'Resize properties' })
    await separator.press('ArrowRight')
    await expect(page.locator('cb-resizable-panel')).toHaveJSProperty('value', 300)
    const docked = page.locator('cb-docked-panel')
    await docked.getByRole('button', { name: 'Collapse inspector' }).click()
    await expect(docked.locator('div[part=content]')).toBeHidden()
    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('popover and hover card are trigger-driven and light dismiss', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const popover = document.createElement('cb-popover')
        const trigger = document.createElement('button'); trigger.slot = 'trigger'; trigger.textContent = 'Show details'
        popover.append(trigger, document.createTextNode('Popover details'))
        const hoverCard = document.createElement('cb-hover-card') as HTMLElement & { delay: number }
        hoverCard.delay = 0
        const hoverTrigger = document.createElement('button'); hoverTrigger.slot = 'trigger'; hoverTrigger.textContent = 'Preview profile'
        hoverCard.append(hoverTrigger, document.createTextNode('Profile preview'))
        document.querySelector('#fixture')?.append(popover, hoverCard)
    })
    const popover = page.locator('cb-popover')
    await page.getByRole('button', { name: 'Show details' }).click()
    await expect(popover.locator('[part~=popover]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(popover.locator('[part~=popover]')).toBeHidden()
    await page.getByRole('button', { name: 'Preview profile' }).hover()
    await expect(page.locator('cb-hover-card').locator('[part~=card]')).toBeVisible()
})

test('drawer and bottom sheet launch and dismiss through their composed controls', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const drawer = document.createElement('cb-drawer') as HTMLElement & { heading: string; closeLabel: string; show(): boolean }
        Object.assign(drawer, { heading: 'Page settings', closeLabel: 'Close page settings' })
        drawer.append(document.createTextNode('Drawer content'))
        const sheet = document.createElement('cb-bottom-sheet') as HTMLElement & { heading: string; closeLabel: string; show(): boolean }
        Object.assign(sheet, { heading: 'Insert block', closeLabel: 'Close block picker' })
        sheet.append(document.createTextNode('Sheet content'))
        document.querySelector('#fixture')?.append(drawer, sheet)
        drawer.show()
    })
    await expect(page.getByRole('dialog', { name: 'Page settings' })).toBeVisible()
    await page.getByRole('button', { name: 'Close page settings' }).click()
    await expect(page.getByRole('dialog', { name: 'Page settings' })).toBeHidden()
    await page.locator('cb-bottom-sheet').evaluate((node: HTMLElement & { show(): boolean }) => node.show())
    await expect(page.getByRole('dialog', { name: 'Insert block' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Insert block' })).toBeHidden()
})
test('modal owns its cancel action, spaces footer actions, and respects dismissal settings', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const modal = document.createElement('cb-modal') as HTMLElement & {
            heading: string
            description: string
            closeLabel: string
            cancelLabel: string
            dismissible: boolean
            showCancel: boolean
            show(): boolean
            close(): boolean
        }
        modal.heading = 'Create a page'
        modal.description = 'Add a page to this project.'
        modal.closeLabel = 'Close create page'
        modal.cancelLabel = 'Cancel'
        modal.append(document.createTextNode('Page settings'))
        const footer = document.createElement('div')
        footer.slot = 'footer'
        const save = document.createElement('cb-button') as HTMLElement & { label: string; variant: string }
        Object.assign(save, { label: 'Create page', variant: 'primary' })
        footer.append(save)
        modal.append(footer)
        modal.addEventListener('close', event => {
            modal.dataset.closeReason = (event as CustomEvent<{ reason: string }>).detail.reason
        })
        modal.addEventListener('cancel', event => {
            modal.dataset.cancelReason = (event as CustomEvent<{ reason: string }>).detail.reason
        })
        document.querySelector('#fixture')?.append(modal)
        modal.show()
    })
    const dialog = page.getByRole('dialog', { name: 'Create a page' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveCSS('border-top-width', '1px')
    await expect(dialog).toHaveCSS('padding', '0px')
    const cancel = dialog.getByRole('button', { name: 'Cancel' })
    const primary = dialog.getByRole('button', { name: 'Create page' })
    await expect(cancel).toBeVisible()
    const cancelBox = await cancel.boundingBox()
    const primaryBox = await primary.boundingBox()
    expect(cancelBox).not.toBeNull()
    expect(primaryBox).not.toBeNull()
    expect((primaryBox?.x ?? 0) - ((cancelBox?.x ?? 0) + (cancelBox?.width ?? 0))).toBeGreaterThanOrEqual(7)
    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])

    await cancel.click()
    await expect(dialog).toBeHidden()
    await expect(page.locator('cb-modal')).toHaveAttribute('data-close-reason', 'cancelled')

    await page.locator('cb-modal').evaluate((modal: HTMLElement & { dismissible: boolean; show(): boolean }) => {
        modal.dismissible = false
        modal.show()
    })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toHaveCount(0)
    await expect(dialog.getByRole('button', { name: 'Close create page' })).toHaveCount(0)
    await dialog.press('Escape')
    await expect(dialog).toBeVisible()

    await page.locator('cb-modal').evaluate((modal: HTMLElement & { dismissible: boolean; showCancel: boolean }) => {
        modal.dismissible = true
        modal.showCancel = false
    })
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toHaveCount(0)
    await dialog.getByRole('button', { name: 'Close create page' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.locator('cb-modal')).toHaveAttribute('data-close-reason', 'close-button')
    await expect(page.locator('cb-modal')).toHaveAttribute('data-cancel-reason', 'close-button')
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
        alert.addEventListener('beforeconfirm', event => event.preventDefault())
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
