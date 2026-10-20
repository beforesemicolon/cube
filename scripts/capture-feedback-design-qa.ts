import { chromium } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Source coordinates are CSS-pixel-sized specimens in the supplied 3376×7728 board.
interface FeedbackSpecimen {
    readonly id: string
    readonly tag: string
    readonly story?: string
    readonly args?: string
    readonly props?: Readonly<Record<string, string>>
    readonly x: number
    readonly y: number
    readonly width: number
    readonly height: number
}
const specimens: readonly FeedbackSpecimen[] = [
    {id:'status',tag:'status',x:1192,y:306,width:288,height:28},
    {id:'skeleton',tag:'skeleton',x:88,y:4078,width:288,height:78},
    {id:'skeleton-card',tag:'skeleton',story:'skeleton',args:'variant:card;lines:2',x:88,y:4204,width:288,height:146},
    {id:'skeleton-table',tag:'skeleton',story:'skeleton',args:'variant:table;rows:3;columns:3',x:88,y:4398,width:288,height:78},
    {id:'progress',tag:'progress',x:1192,y:4078,width:288,height:28},
    {id:'spinner',tag:'spinner',x:2296,y:4082,width:288,height:24},
    {id:'toast',tag:'toast',x:88,y:4968,width:352,height:106},
    {id:'toast-error',tag:'toast',story:'toast',args:'tone:danger',props:{label:'Page could not be published',value:'Check the connection and try again. Your work is preserved.'},x:88,y:5276,width:352,height:122},
    {id:'alert',tag:'alert',x:1192,y:4968,width:320,height:84},
    {id:'banner',tag:'banner',x:88,y:5890,width:400,height:104},
]
const output = resolve(process.env.OUTPUT_ROOT ?? 'design-qa-artifacts/feedback-fidelity')
await mkdir(output,{recursive:true})
const board = (await readFile('design/figma-layers/Studio/05/Data & feedback.png')).toString('base64')
const browser = await chromium.launch({channel:'chrome'})
const metrics: Array<{id:string;appearance:string;width:number;height:number}> = []
try {
    for(const appearance of ['light','dark']) {
        const page = await browser.newPage({viewport:{width:1100,height:800},deviceScaleFactor:1,reducedMotion:'reduce'})
        const rows: string[] = []
        for(const specimen of specimens) {
            const story = specimen.story ?? specimen.id
            const args = specimen.args ? `&args=${encodeURIComponent(specimen.args)}` : ''
            await page.goto(`http://127.0.0.1:6006/iframe.html?id=feedback--${story}&viewMode=story&globals=appearance:${appearance}${args}`)
            const scope = page.locator(`cube-story-events[data-story-id="feedback--${story}"]`)
            const host = scope.locator(`cb-${specimen.tag}[data-story-component]`)
            await host.waitFor({state:'visible'})
            // Storybook intentionally rejects punctuation in URL args. Apply exact
            // specimen copy through public properties, as the Controls panel does.
            if (specimen.props) await host.evaluate((node, props) => { Object.assign(node, props) }, specimen.props)
            await page.evaluate(() => document.fonts.ready)
            // Settle custom-element upgrade and style adoption, not just the story shell.
            await host.locator('[part~=display], [part~=root]').first().waitFor({state:'visible'})
            const bounds = await host.boundingBox()
            if(!bounds)throw new Error(`Missing bounds: ${specimen.id}`)
            metrics.push({id:specimen.id,appearance,width:bounds.width,height:bounds.height})
            const png = await host.screenshot({path:resolve(output,`${specimen.id}-${appearance}.png`),animations:'disabled'})
            const x = specimen.x + (appearance === 'dark' ? 512 : 0)
            rows.push(`<section><h2>${specimen.id} · ${appearance}</h2><div class="pair"><div><h3>Design · 1×</h3><div class="crop" style="width:${specimen.width}px;height:${specimen.height}px"><img src="data:image/png;base64,${board}" style="position:absolute;left:-${x}px;top:-${specimen.y}px;width:3376px;max-width:none"></div></div><div><h3>Implementation · 1× (${bounds.width} × ${bounds.height})</h3><img src="data:image/png;base64,${png.toString('base64')}"></div></div></section>`)
        }
        const sheet = await browser.newPage({viewport:{width:940,height:2800},deviceScaleFactor:1})
        await sheet.setContent(`<style>body{margin:0;background:${appearance==='dark'?'#1d2124':'#f5f6f5'};color:${appearance==='dark'?'#f3f6f8':'#20262b'};font:12px system-ui}section{padding:12px;border-bottom:1px solid #888;break-inside:avoid}h2{font-size:14px;margin:0 0 8px}h3{font-size:11px;font-weight:400;margin:0 0 8px}.pair{display:grid;grid-template-columns:440px 440px;gap:16px}.crop{position:relative;overflow:hidden}img{display:block}</style>${rows.join('')}`)
        await sheet.screenshot({path:resolve(output,`comparison-${appearance}.png`),fullPage:true})
        await sheet.close()
        await page.close()
    }
} finally { await browser.close() }
await writeFile(resolve(output,'metrics.json'),JSON.stringify(metrics,null,2))
process.stdout.write(`Saved ${metrics.length} measured specimens and two 1× comparison sheets to ${output}\n`)
