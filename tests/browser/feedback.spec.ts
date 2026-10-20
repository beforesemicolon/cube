import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Alert } from '../../components/feedback/alert/index.js'
import type { Progress } from '../../components/feedback/progress/index.js'

async function start(page: Page): Promise<void> {
    await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(() => Boolean(customElements.get('cb-skeleton')))
}

for (const appearance of ['light','dark']) test(`feedback follows distinct design patterns in ${appearance}`, async ({page}) => {
    await start(page)
    await page.evaluate(appearance => {
        const theme = document.createElement('cb-theme-provider')
        theme.setAttribute('appearance',appearance)
        const region = document.createElement('div')
        region.style.cssText='display:grid;gap:16px;width:260px;background:var(--color-background);color:var(--color-foreground)'
        for(const [tag,props] of [
            ['cb-status',{value:'All changes saved',tone:'success'}],
            ['cb-spinner',{status:'Loading assets…'}],
            ['cb-progress',{label:'Uploading assets',progress:60,max:100,status:'60%',tone:'info'}],
            ['cb-empty-state',{heading:'Start with your first page',description:'Build from a blank page or a saved template.'}],
            ['cb-toast',{label:'Changes published',value:'Your latest changes are available online.',tone:'success'}],
            ['cb-alert',{label:'Preview is not published',value:'Only people with the preview link can see this version.',tone:'info'}],
            ['cb-banner',{label:'You are offline',value:'Changes are saved on this device until you reconnect.',tone:'warning'}],
        ] as const) {
            const node = document.createElement(tag)
            Object.assign(node,props)
            region.append(node)
        }
        theme.append(region)
        document.querySelector('#fixture')!.append(theme)
    },appearance)
    const status=page.locator('cb-status')
    await expect(status.locator('[part~=indicator]')).toHaveCSS('width','8px')
    await expect(status.locator('[part~=status-card]')).toHaveCSS('min-height','28px')
    await expect(status.locator('cb-icon')).toHaveCount(0)
    await expect(status.locator('[part~=actions]')).toBeHidden()
    const spinner=page.locator('cb-spinner')
    await expect(spinner.getByRole('status')).toContainText('Loading assets…')
    await expect(spinner.locator('[part~=spinner-ring]')).toHaveCSS('width','16px')
    const empty=page.locator('cb-empty-state')
    await expect(empty).toHaveCSS('text-align','center')
    await expect(empty.locator('cb-col')).toHaveCSS('align-items','center')
    await expect(empty.getByRole('heading',{name:'Start with your first page'})).toBeVisible()
    await expect(empty.locator('cb-heading [part=description]')).toHaveText('Build from a blank page or a saved template.')
    await expect(empty.locator('cb-icon')).toHaveAttribute('name','plus')
    await expect(empty.locator('cb-icon svg')).toHaveCSS('width','32px')
    await empty.evaluate(node => node.setAttribute('icon','search'))
    await expect(empty.locator('cb-icon')).toHaveAttribute('name','search')
    await expect(empty.locator('[part=icon-box]')).toHaveCSS('width','64px')
    for(const tag of ['cb-toast','cb-alert','cb-banner']) {
        await expect(page.locator(`${tag} [part~=status-title]`)).toHaveCSS('font-size','14px')
        await expect(page.locator(`${tag} [part~=indicator]`)).toBeVisible()
        await expect(page.locator(`${tag} cb-icon`)).toHaveCount(0)
    }
    await page.locator('cb-alert').evaluate(node => { const alert=node as Alert;alert.tone='danger';alert.label='Connection could not be verified' })
    await expect(page.locator('cb-alert').getByRole('alert')).toContainText('Connection could not be verified')
    const progress=page.locator('cb-progress')
    await expect(progress.locator('[part~=status-title]')).toHaveText('Uploading assets · 60%')
    await expect(progress.locator('[part~=status-title]')).toHaveCSS('display','block')
    await expect(progress.getByRole('progressbar',{name:'Uploading assets'})).toHaveAttribute('value','60')
    await progress.evaluate(node => { (node as Progress).indeterminate=true })
    await expect(progress.getByRole('progressbar')).not.toHaveAttribute('value')
    await page.emulateMedia({reducedMotion:'reduce'})
    await expect(progress.getByRole('progressbar')).toHaveCSS('animation-name','none')
    await expect(spinner.locator('[part~=spinner-ring]')).toHaveCSS('animation-name','none')
    const overflow = await page.locator('#fixture cb-theme-provider > div').evaluate(node => node.scrollWidth > node.clientWidth)
    expect(overflow).toBe(false)
    const audit=await new AxeBuilder({page}).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('feedback action slots react to added and removed consumer content',async({page})=>{
    await start(page)
    await page.evaluate(()=>{
        const empty=document.createElement('cb-empty-state')
        Object.assign(empty,{heading:'No pages'})
        document.querySelector('#fixture')!.append(empty)
    })
    const empty=page.locator('cb-empty-state')
    await expect(empty.getByRole('button')).toHaveCount(0)
    await empty.evaluate(node=>{
        const body=document.createElement('p')
        body.textContent='Any consumer-provided body content.'
        node.append(body)
        node.setAttribute('heading','Nothing matches')
        node.setAttribute('description','Choose what to do next.')
        node.setAttribute('icon','search')
    })
    await expect(empty.getByRole('heading',{name:'Nothing matches'})).toBeVisible()
    await expect(empty.locator('cb-heading [part=description]')).toHaveText('Choose what to do next.')
    await expect(empty.getByText('Any consumer-provided body content.')).toBeVisible()
    await expect(empty.locator('cb-icon')).toHaveAttribute('name','search')
    await empty.evaluate(node=>node.setAttribute('icon',''))
    await expect(empty.locator('[part=icon-box]')).toBeHidden()
    await empty.evaluate(node=>node.replaceChildren())
    await empty.evaluate(node=>{
        const button=document.createElement('cb-button')
        Object.assign(button,{label:'Create page'})
        node.append(button)
    })
    await expect(empty.getByRole('button',{name:'Create page'})).toBeVisible()
    await expect(empty.locator('slot[part=body]')).toHaveCount(1)
    await empty.evaluate(node=>node.replaceChildren())
    await expect(empty.getByRole('button')).toHaveCount(0)
})

test('skeleton renders visible text, card and table placeholders', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const skeleton = document.createElement('cb-skeleton') as HTMLElement & {
            variant: 'text' | 'card' | 'table'
            lines: number
            rows: number
            columns: number
            animated: boolean
            accessibleLabel: string
        }
        Object.assign(skeleton, { variant: 'text', lines: 4, rows: 2, columns: 3, animated: true, accessibleLabel: 'Loading content' })
        document.querySelector('#fixture')?.append(skeleton)
    })
    const skeleton = page.locator('cb-skeleton')
    await expect(skeleton.locator('[part~=line]')).toHaveCount(4)
    await expect(skeleton.locator('[part~=line]').first()).toHaveCSS('width', /\d+px/)
    await expect(skeleton).toHaveCSS('width','288px')
    await expect(skeleton.locator('[part~=line]').first()).toHaveCSS('width','208px')
    await expect(skeleton.locator('[part~=line]').nth(1)).toHaveCSS('width','256px')
    await expect(skeleton.locator('[part~=line]').first()).toHaveCSS('height','10px')
    await expect(skeleton.getByRole('status', { name: 'Loading content' })).toBeVisible()

    await skeleton.evaluate((node: HTMLElement & { variant: 'card'; lines: number }) => { node.variant = 'card'; node.lines = 2 })
    await expect(skeleton.locator('[part~=media]')).toBeVisible()
    await expect(skeleton.locator('[part~=card]')).toHaveCSS('padding','16px')
    await expect(skeleton.locator('[part~=card-content] [part~=line]')).toHaveCount(2)

    await skeleton.evaluate((node: HTMLElement & { variant: 'table'; rows: number; columns: number }) => { node.variant = 'table'; node.rows = 2; node.columns = 3 })
    await expect(skeleton.locator('[part~=row]')).toHaveCount(2)
    await expect(skeleton.locator('[part~=cell]')).toHaveCount(6)
    await expect(skeleton.locator('[part~=cell]').first()).toHaveCSS('height','10px')
    await expect(skeleton.locator('[part~=table]')).toHaveCSS('padding','16px')
    const audit = await new AxeBuilder({ page }).include('#fixture').analyze()
    expect(audit.violations).toEqual([])
})

test('flashbar composes its dismiss action from the shared icon-only button', async ({ page }) => {
    await start(page)
    await page.evaluate(() => {
        const flashbar = document.createElement('cb-flashbar') as HTMLElement & {
            messages: Array<{ id: string; type: string; heading: string; message: string; dismissLabel: string; dismissible: boolean; duration: number }>
        }
        flashbar.messages = [{ id: 'saved', type: 'success', heading: 'Saved', message: 'Changes are current.', dismissLabel: 'Dismiss notification', dismissible: true, duration: 0 }]
        document.querySelector('#fixture')?.append(flashbar)
    })
    const flashbar = page.locator('cb-flashbar')
    const dismiss = flashbar.locator('cb-button[part=dismiss]')
    await expect(dismiss).toBeVisible()
    await expect(dismiss).toHaveAttribute('data-variant', 'ghost')
    await expect(dismiss).toHaveAttribute('data-icon-only', '')
    await expect(dismiss.getByRole('button', { name: 'Dismiss notification' })).toBeVisible()
    await dismiss.click()
    await expect(flashbar.locator('[part=message]')).toHaveCount(0)
})
