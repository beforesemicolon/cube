import type { ChartEngine } from '../components/charts/engine.js'

interface CubeDocsRuntime {
    configureChartEngine(loader: () => Promise<ChartEngine>): void
}

function start(): void {
    for (const link of document.querySelectorAll<HTMLAnchorElement>('article a[href^="/playground/?path=/story/"]')) {
        link.target = '_blank'
        link.relList.add('noopener')
    }

    const previews = document.querySelectorAll<HTMLElement>('[data-cube-preview]')
    if (!previews.length) return
    const runtime = globalThis as typeof globalThis & { BFS?: { CUBE?: CubeDocsRuntime }; echarts?: ChartEngine }
    const cube = runtime.BFS?.CUBE
    if (!cube) return
    cube.configureChartEngine(() => new Promise((resolve,reject) => {
        const existing = runtime.echarts
        if (existing) { resolve(existing); return }
        const script=document.createElement('script');script.src='/assets/cube/echarts.js'
        script.onload=()=>{ if(runtime.echarts)resolve(runtime.echarts);else reject(new Error('Chart engine unavailable')) }
        script.onerror=()=>{script.remove();reject(new Error('Chart engine unavailable'))};document.head.append(script)
    }))
    for (const container of previews) {
        const source = document.createElement('template')
        source.innerHTML = container.dataset.cubePreview ?? ''
        const provider = document.createElement('cb-theme-provider')
        provider.setAttribute('appearance', 'system')
        provider.append(source.content)
        container.append(provider)
        container.addEventListener('click', event => {
            const opener = event.composedPath().find(
                (target): target is HTMLElement => target instanceof HTMLElement && target.hasAttribute('data-cube-open')
            )
            const id = opener?.dataset.cubeOpen
            if (!id) return
            const target = provider.querySelector(`#${CSS.escape(id)}`)
            if (!target) return
            if (target.localName === 'cb-context-menu') {
                target.setAttribute('x', String(event.clientX))
                target.setAttribute('y', String(event.clientY))
            }
            target.setAttribute('open', 'true')
        })
    }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()
