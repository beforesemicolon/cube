import type { ChartEngine } from '../components/charts/engine.js'
import { studioDefinitions } from '../components/studio/catalog.js'
interface CubeDocsRuntime {
    configureChartEngine(loader: () => Promise<ChartEngine>): void
    showModal(request: { heading: string; description: string; body: string }): Promise<{ id: string; reason: string }>
}

interface ExampleCopy {
    box: string
    row: string
    grid: string
    openModal: string
    modalHeading: string
    modalDescription: string
    modalBody: string
    savedHeading: string
    savedMessage: string
    design: string
    preview: string
    code: string
    addElement: string
}

const exampleCopy: Readonly<Record<string, ExampleCopy>> = {
    en: { box:'Box',row:'Row',grid:'Grid',openModal:'Open modal',modalHeading:'Example modal',modalDescription:'A native, themed dialog.',modalBody:'Modal copy is supplied by the application.',savedHeading:'Changes saved',savedMessage:'The preview is up to date.',design:'Design',preview:'Preview',code:'Code',addElement:'Add element' },
    pt: { box:'Caixa',row:'Linha',grid:'Grelha',openModal:'Abrir modal',modalHeading:'Modal de exemplo',modalDescription:'Um diálogo nativo com tema.',modalBody:'O texto do modal é fornecido pela aplicação.',savedHeading:'Alterações guardadas',savedMessage:'A pré-visualização está atualizada.',design:'Design',preview:'Pré-visualização',code:'Código',addElement:'Adicionar elemento' },
    es: { box:'Caja',row:'Fila',grid:'Cuadrícula',openModal:'Abrir modal',modalHeading:'Modal de ejemplo',modalDescription:'Un diálogo nativo con tema.',modalBody:'La aplicación proporciona el texto del modal.',savedHeading:'Cambios guardados',savedMessage:'La vista previa está actualizada.',design:'Diseño',preview:'Vista previa',code:'Código',addElement:'Añadir elemento' },
    fr: { box:'Boîte',row:'Ligne',grid:'Grille',openModal:'Ouvrir la modale',modalHeading:'Exemple de modale',modalDescription:'Un dialogue natif avec thème.',modalBody:'Le texte de la modale est fourni par l’application.',savedHeading:'Modifications enregistrées',savedMessage:'L’aperçu est à jour.',design:'Conception',preview:'Aperçu',code:'Code',addElement:'Ajouter un élément' },
    zh: { box:'容器',row:'行',grid:'网格',openModal:'打开模态框',modalHeading:'模态框示例',modalDescription:'使用主题的原生对话框。',modalBody:'模态框文本由应用提供。',savedHeading:'更改已保存',savedMessage:'预览已是最新版本。',design:'设计',preview:'预览',code:'代码',addElement:'添加元素' },
}

function copy(): ExampleCopy { return exampleCopy[document.documentElement.lang.toLowerCase().split('-')[0] ?? 'en'] ?? exampleCopy.en }

function renderLayout(container: HTMLElement, provider: HTMLElement): void {
    const grid = document.createElement('cb-grid')
    Object.assign(grid, { columns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 'var(--spacing-md)' })
    const labels = copy()
    for (const label of [labels.box, labels.row, labels.grid]) {
        const box = document.createElement('cb-box')
        Object.assign(box, { padding: 'var(--spacing-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-separator)', radius: 'var(--radius-md)' })
        box.textContent = label
        grid.append(box)
    }
    provider.append(grid)
    container.append(provider)
}

function renderOverlays(container: HTMLElement, provider: HTMLElement, cube: CubeDocsRuntime): void {
    const labels = copy()
    const row = document.createElement('cb-row')
    Object.assign(row, { gap: 'var(--spacing-sm)', wrap: true })
    const button = document.createElement('cb-button')
    Object.assign(button, { label: labels.openModal, variant: 'primary' })
    button.addEventListener('cb-action', () => { void cube.showModal({ heading: labels.modalHeading, description: labels.modalDescription, body: labels.modalBody }) })
    const flashbar = document.createElement('cb-flashbar') as HTMLElement & { show(message: { type: string; heading: string; message: string; duration: number }): string }
    flashbar.style.position = 'relative'
    flashbar.style.inset = 'auto'
    flashbar.show({ type: 'success', heading: labels.savedHeading, message: labels.savedMessage, duration: 0 })
    row.append(button)
    provider.append(row, flashbar)
    container.append(provider)
}

function renderActions(container: HTMLElement, provider: HTMLElement): void {
    const labels = copy()
    const row = document.createElement('cb-row')
    Object.assign(row, { gap: 'var(--spacing-md)', wrap: true, align: 'center' })
    const segmented = document.createElement('cb-segmented-control')
    Object.assign(segmented, { value: 'design', items: [{ id:'design',label:labels.design },{ id:'preview',label:labels.preview },{ id:'code',label:labels.code }] })
    const dropdown = document.createElement('cb-dropdown')
    Object.assign(dropdown, { label: labels.addElement, icon: 'plus', items: [{ id:'text',label:labels.design,icon:'text' },{ id:'image',label:labels.preview,icon:'image' }] })
    const pagination = document.createElement('cb-pagination')
    Object.assign(pagination, { page: 2, totalPages: 12 })
    row.append(segmented, dropdown, pagination); provider.append(row); container.append(provider)
}

function renderStudio(container: HTMLElement, provider: HTMLElement, category: string): void {
    const grid = document.createElement('cb-grid')
    Object.assign(grid, { columns:'repeat(auto-fit,minmax(220px,1fr))', gap:'var(--spacing-md)' })
    for (const definition of studioDefinitions.filter(item => item.category === category)) {
        const card = document.createElement('cb-box')
        Object.assign(card, { padding:'var(--spacing-md)', background:'var(--color-surface)', border:'1px solid var(--color-separator)', radius:'var(--radius-md)', overflow:'hidden' })
        const heading = document.createElement('strong')
        heading.textContent = definition.title
        heading.style.cssText = 'display:block;margin-block-end:var(--spacing-sm)'
        const component = document.createElement(`cb-${definition.name}`)
        const items = [{id:'one',label:'A'},{id:'two',label:'B'},{id:'three',label:'C',disabled:true}]
        Object.assign(component, { label:definition.title, accessibleLabel:definition.title, value:definition.kind === 'range' || definition.kind === 'number' ? 48 : 'one', checked:true, progress:64, max:100, status:definition.kind === 'progress' ? '64%' : '', items })
        if (['panel','editor','shell'].includes(definition.kind)) component.textContent = definition.title
        card.append(heading, component)
        grid.append(card)
    }
    provider.append(grid)
    container.append(provider)
}

function start(): void {
    const containers = document.querySelectorAll<HTMLElement>('[data-cube-example]')
    if (!containers.length) return
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
    for (const container of containers) {
        const kind=container.dataset.cubeExample!
        const provider=document.createElement('cb-theme-provider');provider.setAttribute('appearance','system')
        if(kind==='action'){renderActions(container,provider);continue}
        if(kind==='layout'){renderLayout(container,provider);continue}
        if(kind==='overlay'){renderOverlays(container,provider,cube);continue}
        if(kind.startsWith('studio-')){renderStudio(container,provider,kind.slice(7));continue}
        const element=document.createElement('cb-'+kind);element.setAttribute('locale',document.documentElement.lang||'en')
        if(kind==='cartesian-chart')Object.assign(element,{xAxis:{type:'category',categories:['A','B','C','D']},series:[{id:'a',name:'A',type:'column',data:[12,18,14,22]},{id:'b',name:'B',type:'line',data:[15,16,20,24]}]})
        if(kind==='pie-chart')Object.assign(element,{variant:'donut',innerTitle:'100',series:{data:[{id:'a',name:'A',value:48},{id:'b',name:'B',value:32},{id:'c',name:'C',value:20}]}})
        if(kind==='video-player')Object.assign(element,{poster:'/assets/cube/poster.svg'})
        provider.append(element);container.append(provider)
    }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()
