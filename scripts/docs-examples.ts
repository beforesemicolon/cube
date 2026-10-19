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
    media: Readonly<Record<string, string>>
    chart: Readonly<Record<string, string>>
}

const exampleCopy: Readonly<Record<string, ExampleCopy>> = {
    en: { box:'Box',row:'Row',grid:'Grid',openModal:'Open modal',modalHeading:'Example modal',modalDescription:'A native, themed dialog.',modalBody:'Modal copy is supplied by the application.',savedHeading:'Changes saved',savedMessage:'The preview is up to date.',design:'Design',preview:'Preview',code:'Code',addElement:'Add element',media:{mediaTitle:'Media',playLabel:'Play',pauseLabel:'Pause',stopLabel:'Stop',backwardLabel:'Seek backward',forwardLabel:'Seek forward',seekLabel:'Seek',volumeLabel:'Volume',muteLabel:'Mute',unmuteLabel:'Unmute',rateLabel:'Playback speed',captionsLabel:'Captions',captionsOffLabel:'Captions off',fullscreenLabel:'Enter fullscreen',exitFullscreenLabel:'Exit fullscreen',emptyText:'No media source.',errorText:'Unable to play this media.',bufferingText:'Buffering',liveText:'Live'},chart:{accessibleLabel:'Chart',loadingText:'Loading chart',emptyText:'No data available.',noMatchText:'No visible data',errorText:'Unable to load chart.',retryLabel:'Retry',showAllLabel:'Show all',legendLabel:'Legend',tableLabel:'View data table',seriesLabel:'Series',categoryLabel:'Category',valueLabel:'Value',rangeLabel:'Range',sizeLabel:'Size',percentageLabel:'Percentage',missingText:'Not available',navigateLabel:'Explore chart',instructionsText:'Use arrow keys to explore points.',pinnedText:'Pinned',unpinLabel:'Unpin',zoomInLabel:'Zoom in',zoomOutLabel:'Zoom out',resetZoomLabel:'Reset zoom'} },
    pt: { box:'Caixa',row:'Linha',grid:'Grelha',openModal:'Abrir modal',modalHeading:'Modal de exemplo',modalDescription:'Um diálogo nativo com tema.',modalBody:'O texto do modal é fornecido pela aplicação.',savedHeading:'Alterações guardadas',savedMessage:'A pré-visualização está atualizada.',design:'Design',preview:'Pré-visualização',code:'Código',addElement:'Adicionar elemento',media:{mediaTitle:'Multimédia',playLabel:'Reproduzir',pauseLabel:'Pausar',stopLabel:'Parar',backwardLabel:'Recuar',forwardLabel:'Avançar',seekLabel:'Procurar',volumeLabel:'Volume',muteLabel:'Silenciar',unmuteLabel:'Ativar som',rateLabel:'Velocidade',captionsLabel:'Legendas',captionsOffLabel:'Sem legendas',fullscreenLabel:'Ecrã inteiro',exitFullscreenLabel:'Sair do ecrã inteiro',emptyText:'Sem fonte multimédia.',errorText:'Não foi possível reproduzir.',bufferingText:'A carregar',liveText:'Ao vivo'},chart:{accessibleLabel:'Gráfico',loadingText:'A carregar gráfico',emptyText:'Sem dados.',noMatchText:'Sem dados visíveis',errorText:'Não foi possível carregar.',retryLabel:'Tentar novamente',showAllLabel:'Mostrar tudo',legendLabel:'Legenda',tableLabel:'Ver tabela de dados',seriesLabel:'Série',categoryLabel:'Categoria',valueLabel:'Valor',rangeLabel:'Intervalo',sizeLabel:'Tamanho',percentageLabel:'Percentagem',missingText:'Indisponível',navigateLabel:'Explorar gráfico',instructionsText:'Use as setas para explorar os pontos.',pinnedText:'Fixado',unpinLabel:'Desafixar',zoomInLabel:'Ampliar',zoomOutLabel:'Reduzir',resetZoomLabel:'Repor zoom'} },
    es: { box:'Caja',row:'Fila',grid:'Cuadrícula',openModal:'Abrir modal',modalHeading:'Modal de ejemplo',modalDescription:'Un diálogo nativo con tema.',modalBody:'La aplicación proporciona el texto del modal.',savedHeading:'Cambios guardados',savedMessage:'La vista previa está actualizada.',design:'Diseño',preview:'Vista previa',code:'Código',addElement:'Añadir elemento',media:{mediaTitle:'Multimedia',playLabel:'Reproducir',pauseLabel:'Pausar',stopLabel:'Detener',backwardLabel:'Retroceder',forwardLabel:'Avanzar',seekLabel:'Buscar',volumeLabel:'Volumen',muteLabel:'Silenciar',unmuteLabel:'Activar sonido',rateLabel:'Velocidad',captionsLabel:'Subtítulos',captionsOffLabel:'Sin subtítulos',fullscreenLabel:'Pantalla completa',exitFullscreenLabel:'Salir de pantalla completa',emptyText:'Sin fuente multimedia.',errorText:'No se pudo reproducir.',bufferingText:'Cargando',liveText:'En directo'},chart:{accessibleLabel:'Gráfico',loadingText:'Cargando gráfico',emptyText:'No hay datos.',noMatchText:'No hay datos visibles',errorText:'No se pudo cargar.',retryLabel:'Reintentar',showAllLabel:'Mostrar todo',legendLabel:'Leyenda',tableLabel:'Ver tabla de datos',seriesLabel:'Serie',categoryLabel:'Categoría',valueLabel:'Valor',rangeLabel:'Rango',sizeLabel:'Tamaño',percentageLabel:'Porcentaje',missingText:'No disponible',navigateLabel:'Explorar gráfico',instructionsText:'Usa las flechas para explorar los puntos.',pinnedText:'Fijado',unpinLabel:'Desfijar',zoomInLabel:'Acercar',zoomOutLabel:'Alejar',resetZoomLabel:'Restablecer zoom'} },
    fr: { box:'Boîte',row:'Ligne',grid:'Grille',openModal:'Ouvrir la modale',modalHeading:'Exemple de modale',modalDescription:'Un dialogue natif avec thème.',modalBody:'Le texte de la modale est fourni par l’application.',savedHeading:'Modifications enregistrées',savedMessage:'L’aperçu est à jour.',design:'Conception',preview:'Aperçu',code:'Code',addElement:'Ajouter un élément',media:{mediaTitle:'Média',playLabel:'Lire',pauseLabel:'Pause',stopLabel:'Arrêter',backwardLabel:'Reculer',forwardLabel:'Avancer',seekLabel:'Rechercher',volumeLabel:'Volume',muteLabel:'Couper le son',unmuteLabel:'Rétablir le son',rateLabel:'Vitesse',captionsLabel:'Sous-titres',captionsOffLabel:'Sans sous-titres',fullscreenLabel:'Plein écran',exitFullscreenLabel:'Quitter le plein écran',emptyText:'Aucune source média.',errorText:'Lecture impossible.',bufferingText:'Chargement',liveText:'En direct'},chart:{accessibleLabel:'Graphique',loadingText:'Chargement du graphique',emptyText:'Aucune donnée.',noMatchText:'Aucune donnée visible',errorText:'Chargement impossible.',retryLabel:'Réessayer',showAllLabel:'Tout afficher',legendLabel:'Légende',tableLabel:'Voir le tableau de données',seriesLabel:'Série',categoryLabel:'Catégorie',valueLabel:'Valeur',rangeLabel:'Plage',sizeLabel:'Taille',percentageLabel:'Pourcentage',missingText:'Indisponible',navigateLabel:'Explorer le graphique',instructionsText:'Utilisez les flèches pour explorer les points.',pinnedText:'Épinglé',unpinLabel:'Désépingler',zoomInLabel:'Zoom avant',zoomOutLabel:'Zoom arrière',resetZoomLabel:'Réinitialiser le zoom'} },
    zh: { box:'容器',row:'行',grid:'网格',openModal:'打开模态框',modalHeading:'模态框示例',modalDescription:'使用主题的原生对话框。',modalBody:'模态框文本由应用提供。',savedHeading:'更改已保存',savedMessage:'预览已是最新版本。',design:'设计',preview:'预览',code:'代码',addElement:'添加元素',media:{mediaTitle:'媒体',playLabel:'播放',pauseLabel:'暂停',stopLabel:'停止',backwardLabel:'后退',forwardLabel:'前进',seekLabel:'进度',volumeLabel:'音量',muteLabel:'静音',unmuteLabel:'取消静音',rateLabel:'播放速度',captionsLabel:'字幕',captionsOffLabel:'关闭字幕',fullscreenLabel:'进入全屏',exitFullscreenLabel:'退出全屏',emptyText:'没有媒体源。',errorText:'无法播放媒体。',bufferingText:'缓冲中',liveText:'直播'},chart:{accessibleLabel:'图表',loadingText:'正在加载图表',emptyText:'没有数据。',noMatchText:'没有可见数据',errorText:'无法加载图表。',retryLabel:'重试',showAllLabel:'显示全部',legendLabel:'图例',tableLabel:'查看数据表',seriesLabel:'系列',categoryLabel:'类别',valueLabel:'值',rangeLabel:'范围',sizeLabel:'大小',percentageLabel:'百分比',missingText:'不可用',navigateLabel:'浏览图表',instructionsText:'使用方向键浏览数据点。',pinnedText:'已固定',unpinLabel:'取消固定',zoomInLabel:'放大',zoomOutLabel:'缩小',resetZoomLabel:'重置缩放'} },
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
    button.addEventListener('action', () => { void cube.showModal({ heading: labels.modalHeading, description: labels.modalDescription, body: labels.modalBody }) })
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
        const element=document.createElement('cb-'+kind)
        const labels=copy()
        if(kind==='audio-player'||kind==='video-player')Object.assign(element,labels.media)
        if(kind==='cartesian-chart'||kind==='pie-chart')Object.assign(element,labels.chart)
        if(kind==='cartesian-chart')Object.assign(element,{xAxis:{type:'category',categories:['A','B','C','D']},series:[{id:'a',name:'A',type:'column',data:[12,18,14,22]},{id:'b',name:'B',type:'line',data:[15,16,20,24]}]})
        if(kind==='pie-chart')Object.assign(element,{variant:'donut',innerTitle:'100',series:{data:[{id:'a',name:'A',value:48},{id:'b',name:'B',value:32},{id:'c',name:'C',value:20}]}})
        if(kind==='video-player')Object.assign(element,{poster:'/assets/cube/poster.svg'})
        provider.append(element);container.append(provider)
    }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()
