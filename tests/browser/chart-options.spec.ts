import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {chartExamples,type ChartExampleName} from '../../stories/fixtures/chart-types.js'
type ThemeElement = HTMLElement & { appearance: string }
const chartText={accessibleLabel:'Chart',loadingText:'Loading chart',emptyText:'No data available.',noMatchText:'No visible data',errorText:'Unable to load chart.',retryLabel:'Retry',showAllLabel:'Show all',legendLabel:'Legend',tableLabel:'View data table',seriesLabel:'Series',categoryLabel:'Category',valueLabel:'Value',rangeLabel:'Range',sizeLabel:'Size',percentageLabel:'Percentage',missingText:'Not available',navigateLabel:'Explore chart',instructionsText:'Use arrow keys to explore data points.',pinnedText:'Pinned',unpinLabel:'Unpin',zoomInLabel:'Zoom in',zoomOutLabel:'Zoom out',resetZoomLabel:'Reset zoom'}
const mediaText={playLabel:'Play',pauseLabel:'Pause',stopLabel:'Stop',backwardLabel:'Seek backward',forwardLabel:'Seek forward',seekLabel:'Playback position',volumeLabel:'Volume',muteLabel:'Mute',unmuteLabel:'Unmute',rateLabel:'Playback speed',captionsLabel:'Captions',captionsOffLabel:'Captions off',fullscreenLabel:'Enter fullscreen',exitFullscreenLabel:'Exit fullscreen',emptyText:'No media source.',errorText:'Unable to play this media.',bufferingText:'Buffering',liveText:'Live'}
for(const appearance of ['light','dark'])for(const type of Object.keys(chartExamples) as ChartExampleName[])test(`${type} renders with real ECharts and shared controls in ${appearance}`,async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/tests/browser/fixture.html')
    await page.waitForFunction(()=>!!customElements.get('cb-cartesian-chart'))
    await page.locator('#theme').evaluate((n:ThemeElement,mode)=>n.appearance=mode,appearance)
    const example=chartExamples[type]
    await page.evaluate(({example,chartText})=>{const n=document.createElement(example.tag);Object.assign(n,chartText,example.props);document.querySelector('#fixture')!.append(n)},{example,chartText})
    const chart=page.locator(example.tag);await expect(chart.locator('[part=plot] svg')).toBeVisible()
    const toggle=chart.locator('cb-toggle-button[part=legend-item]').first();await expect(toggle).toBeVisible()
    const button=toggle.getByRole('button');await button.click();await expect(button).toHaveAttribute('aria-pressed','false');await button.click();await expect(button).toHaveAttribute('aria-pressed','true')
    const before=await chart.locator('[part=details]').textContent();const nav=chart.locator('[part=navigator]').getByRole('button');await nav.focus();await expect(nav).toBeFocused();await page.keyboard.press('ArrowRight');await expect(chart.locator('[part=details]')).not.toHaveText(before??'')
    const summary=chart.locator('summary');await summary.focus();await page.keyboard.press('Enter');await expect(chart.getByRole('table')).toBeVisible();await page.keyboard.press('Enter')
    const violations=await new AxeBuilder({page}).include(example.tag).analyze();expect(violations.violations).toEqual([])
    await page.setViewportSize({width:390,height:844});await expect(chart.locator('[part=plot] svg')).toBeVisible()
    await expect.poll(()=>chart.evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true)
    await chart.screenshot({path:`test-results/${type}-${appearance}.png`})
})
test('media players compose the library icon buttons, range inputs and selects',async({page})=>{
    await page.goto('/tests/browser/fixture.html');await page.waitForFunction(()=>!!customElements.get('cb-audio-player'))
    await page.evaluate(async(mediaText)=>{const {silentAudio}=await import('/stories/helpers.ts');const n=document.createElement('cb-audio-player');Object.assign(n,mediaText,{src:silentAudio(8),mediaTitle:'Recording'});document.querySelector('#fixture')!.append(n)},mediaText)
    const player=page.locator('cb-audio-player');await expect(player.locator('cb-icon-button[part=play]')).toBeVisible();await expect(player.locator('cb-slider[part=seek]')).toBeVisible();await expect(player.locator('cb-select[part=rate]')).toBeVisible()
    await expect.poll(()=>player.locator('audio').evaluate((n:HTMLAudioElement)=>n.duration)).toBe(8)
    const seek=player.getByRole('slider',{name:'Playback position',exact:true});await expect(seek).toBeEnabled();await seek.focus();await page.keyboard.press('ArrowRight');expect(await player.locator('audio').evaluate((n:HTMLAudioElement)=>n.currentTime)).toBeGreaterThan(0)
    const rate=player.locator('cb-select[part=rate]');await rate.getByRole('button',{name:'Playback speed'}).click();await rate.locator('[part~=popup]').getByRole('option',{name:'1.5×'}).click();await expect.poll(()=>player.locator('audio').evaluate((n:HTMLAudioElement)=>n.playbackRate)).toBe(1.5)
    await page.locator('#theme').evaluate((n:ThemeElement)=>n.appearance='dark');await expect(player.locator('[part=player]')).toHaveCSS('background-color','rgb(29, 33, 36)')
    await page.setViewportSize({width:320,height:844});expect(await player.evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);await player.screenshot({path:'test-results/audio-ready-dark-narrow.png'})
})

test('video playback, finite seeking, captions and themed composed controls',async({page})=>{
    await page.goto('/tests/browser/fixture.html');await page.waitForFunction(()=>!!customElements.get('cb-video-player'))
    await page.evaluate(mediaText=>{const n=document.createElement('cb-video-player');Object.assign(n,mediaText,{src:'/design/fixtures/studio.webm',poster:'/design/poster.svg',mediaTitle:'Studio film',seekStep:1,tracks:[{src:'/design/captions.vtt',language:'en',label:'English'}]});document.querySelector('#fixture')!.append(n)},mediaText)
    const player=page.locator('cb-video-player'),media=player.locator('video')
    await expect.poll(()=>media.evaluate((n:HTMLVideoElement)=>n.duration)).toBe(4)
    const seek=player.getByRole('slider',{name:'Playback position',exact:true});await expect(seek).toBeEnabled()
    await player.getByRole('button',{name:'Play',exact:true}).click();await expect.poll(()=>media.evaluate((n:HTMLVideoElement)=>n.paused)).toBe(false)
    await player.getByRole('button',{name:'Pause',exact:true}).click();await expect.poll(()=>media.evaluate((n:HTMLVideoElement)=>n.paused)).toBe(true)
    await seek.focus();await page.keyboard.press('ArrowRight');expect(await media.evaluate((n:HTMLVideoElement)=>n.currentTime)).toBeGreaterThan(0)
    const captions=player.locator('cb-select[part=captions]');await captions.getByRole('button',{name:/^Captions:/}).click();await captions.locator('[part~=popup]').getByRole('option',{name:'English'}).click()
    await expect.poll(()=>media.evaluate((n:HTMLVideoElement)=>n.textTracks[0]?.mode)).toBe('showing')
    await player.getByRole('button',{name:'Stop',exact:true}).click();await expect.poll(()=>media.evaluate((n:HTMLVideoElement)=>n.currentTime)).toBe(0)
    await player.getByRole('button',{name:'Enter fullscreen',exact:true}).click()
    await expect.poll(()=>player.evaluate(n=>document.fullscreenElement===n)).toBe(true)
    const fullscreenLayout=await player.evaluate(n=>{
        const video=n.shadowRoot?.querySelector('video'),surface=n.shadowRoot?.querySelector('[part="player"]')
        const bounds=(element:Element|null|undefined)=>{const rect=element?.getBoundingClientRect();return rect?{width:rect.width,height:rect.height}:null}
        return {host:bounds(n),surface:bounds(surface),video:bounds(video),viewport:{width:innerWidth,height:innerHeight}}
    })
    expect(fullscreenLayout.host?.width).toBe(fullscreenLayout.viewport.width)
    expect(fullscreenLayout.host?.height).toBe(fullscreenLayout.viewport.height)
    expect(fullscreenLayout.surface).toEqual(fullscreenLayout.host)
    expect(fullscreenLayout.video?.width).toBe(fullscreenLayout.viewport.width)
    expect(fullscreenLayout.video?.height).toBeGreaterThan(fullscreenLayout.viewport.height*.65)
    await player.screenshot({path:'test-results/video-fullscreen-light.png'})
    await player.getByRole('button',{name:'Exit fullscreen',exact:true}).click()
    await expect.poll(()=>player.evaluate(n=>document.fullscreenElement===n)).toBe(false)
    await player.screenshot({path:'test-results/video-ready-light.png'})
    await page.locator('#theme').evaluate((n:ThemeElement)=>n.appearance='dark');await page.setViewportSize({width:390,height:844})
    await expect(player.locator('[part=player]')).toHaveCSS('background-color','rgb(29, 33, 36)')
    expect(await player.evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true)
    await player.screenshot({path:'test-results/video-ready-dark-narrow.png'})
})
