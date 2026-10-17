import type { ChartEngine } from '../components/charts/engine.js'
function start(): void {
    const containers = document.querySelectorAll<HTMLElement>('[data-cube-example]')
    if (!containers.length) return
    const cube = (globalThis as unknown as { BFS: { CUBE: { configureChartEngine(loader:()=>Promise<ChartEngine>):void } } }).BFS.CUBE
    cube.configureChartEngine(() => new Promise((resolve,reject) => {
        const existing = (globalThis as unknown as { echarts?: ChartEngine }).echarts
        if (existing) { resolve(existing); return }
        const script=document.createElement('script');script.src='/assets/cube/echarts.js'
        script.onload=()=>resolve((globalThis as unknown as {echarts:ChartEngine}).echarts)
        script.onerror=()=>{script.remove();reject(new Error('Chart engine unavailable'))};document.head.append(script)
    }))
    for (const container of containers) {
        const kind=container.dataset.cubeExample!
        const provider=document.createElement('cb-theme-provider');provider.setAttribute('appearance','system')
        const element=document.createElement('cb-'+kind);element.setAttribute('locale',document.documentElement.lang||'en')
        if(kind==='cartesian-chart')Object.assign(element,{xAxis:{type:'category',categories:['A','B','C','D']},series:[{id:'a',name:'A',type:'column',data:[12,18,14,22]},{id:'b',name:'B',type:'line',data:[15,16,20,24]}]})
        if(kind==='pie-chart')Object.assign(element,{variant:'donut',innerTitle:'100',series:{data:[{id:'a',name:'A',value:48},{id:'b',name:'B',value:32},{id:'c',name:'C',value:20}]}})
        if(kind==='video-player')Object.assign(element,{poster:'/assets/cube/poster.svg'})
        provider.append(element);container.append(provider)
    }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()
