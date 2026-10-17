import { record, text } from '../core/value.js'
export const en = {
    audio: 'Audio player', video: 'Video player', play: 'Play', pause: 'Pause', stop: 'Stop',
    backward: 'Seek backward', forward: 'Seek forward', seek: 'Playback position',
    volume: 'Volume', mute: 'Mute', unmute: 'Unmute', rate: 'Playback speed',
    captions: 'Captions', captionsOff: 'Off', fullscreen: 'Full screen', exitFullscreen: 'Exit full screen',
    mediaEmpty: 'Choose a media source.', mediaError: 'Media could not be played.', buffering: 'Buffering…',
    live: 'Live', chart: 'Chart', loading: 'Loading…', empty: 'No data available.',
    noMatch: 'No visible data. Show a series or segment.', error: 'The chart could not load.',
    retry: 'Retry', showAll: 'Show all', legend: 'Visible data', table: 'View data table',
    series: 'Series', category: 'Category', value: 'Value', range: 'Range', size: 'Size',
    percentage: 'Percentage', missing: 'Not available', details: 'Data details',
    navigate: 'Explore data points', instructions: 'Left and right move between points. Up and down change series. Home and End move to the first or last point. Enter pins details; Escape unpins.',
    pinned: 'Pinned', unpin: 'Unpin details', zoomIn: 'Zoom in', zoomOut: 'Zoom out', resetZoom: 'Reset zoom',
    themeError: 'The theme could not load.',
} as const
export type Messages = { [K in keyof typeof en]: string }
export const pt: Messages = {
    audio: 'Reprodutor de áudio', video: 'Reprodutor de vídeo', play: 'Reproduzir', pause: 'Pausar', stop: 'Parar',
    backward: 'Recuar', forward: 'Avançar', seek: 'Posição de reprodução', volume: 'Volume',
    mute: 'Silenciar', unmute: 'Ativar som', rate: 'Velocidade', captions: 'Legendas', captionsOff: 'Desativadas',
    fullscreen: 'Ecrã inteiro', exitFullscreen: 'Sair do ecrã inteiro', mediaEmpty: 'Escolha uma fonte multimédia.',
    mediaError: 'Não foi possível reproduzir o conteúdo.', buffering: 'A carregar…', live: 'Em direto',
    chart: 'Gráfico', loading: 'A carregar…', empty: 'Não existem dados.', noMatch: 'Não há dados visíveis. Mostre uma série ou segmento.',
    error: 'Não foi possível carregar o gráfico.', retry: 'Tentar novamente', showAll: 'Mostrar todos', legend: 'Dados visíveis',
    table: 'Ver tabela de dados', series: 'Série', category: 'Categoria', value: 'Valor', range: 'Intervalo', size: 'Tamanho',
    percentage: 'Percentagem', missing: 'Não disponível', details: 'Detalhes dos dados', navigate: 'Explorar pontos',
    instructions: 'As setas esquerda e direita mudam o ponto. As setas para cima e para baixo mudam a série. Home e End selecionam o primeiro ou último ponto. Enter fixa os detalhes; Escape liberta-os.',
    pinned: 'Fixado', unpin: 'Libertar detalhes', zoomIn: 'Ampliar', zoomOut: 'Reduzir', resetZoom: 'Repor ampliação',
    themeError: 'Não foi possível carregar o tema.',
}
export const es: Messages = {
    audio: 'Reproductor de audio', video: 'Reproductor de vídeo', play: 'Reproducir', pause: 'Pausar', stop: 'Detener',
    backward: 'Retroceder', forward: 'Avanzar', seek: 'Posición de reproducción', volume: 'Volumen', mute: 'Silenciar', unmute: 'Activar sonido', rate: 'Velocidad',
    captions: 'Subtítulos', captionsOff: 'Desactivados', fullscreen: 'Pantalla completa', exitFullscreen: 'Salir de pantalla completa',
    mediaEmpty: 'Elige una fuente multimedia.', mediaError: 'No se pudo reproducir el contenido.', buffering: 'Cargando…', live: 'En directo',
    chart: 'Gráfico', loading: 'Cargando…', empty: 'No hay datos disponibles.', noMatch: 'No hay datos visibles. Muestra una serie o un segmento.', error: 'No se pudo cargar el gráfico.',
    retry: 'Reintentar', showAll: 'Mostrar todo', legend: 'Datos visibles', table: 'Ver tabla de datos', series: 'Serie', category: 'Categoría', value: 'Valor', range: 'Intervalo', size: 'Tamaño',
    percentage: 'Porcentaje', missing: 'No disponible', details: 'Detalles de los datos', navigate: 'Explorar puntos',
    instructions: 'Las flechas izquierda y derecha cambian el punto. Arriba y abajo cambian la serie. Inicio y Fin seleccionan el primer o último punto. Intro fija los detalles; Escape los libera.',
    pinned: 'Fijado', unpin: 'Liberar detalles', zoomIn: 'Acercar', zoomOut: 'Alejar', resetZoom: 'Restablecer zoom', themeError: 'No se pudo cargar el tema.',
}
export const fr: Messages = {
    audio: 'Lecteur audio', video: 'Lecteur vidéo', play: 'Lire', pause: 'Mettre en pause', stop: 'Arrêter', backward: 'Reculer', forward: 'Avancer', seek: 'Position de lecture',
    volume: 'Volume', mute: 'Couper le son', unmute: 'Rétablir le son', rate: 'Vitesse de lecture', captions: 'Sous-titres', captionsOff: 'Désactivés',
    fullscreen: 'Plein écran', exitFullscreen: 'Quitter le plein écran', mediaEmpty: 'Choisissez une source multimédia.', mediaError: 'Impossible de lire le contenu.', buffering: 'Chargement…', live: 'En direct',
    chart: 'Graphique', loading: 'Chargement…', empty: 'Aucune donnée disponible.', noMatch: 'Aucune donnée visible. Affichez une série ou un segment.', error: 'Impossible de charger le graphique.',
    retry: 'Réessayer', showAll: 'Tout afficher', legend: 'Données visibles', table: 'Voir le tableau des données', series: 'Série', category: 'Catégorie', value: 'Valeur', range: 'Intervalle', size: 'Taille',
    percentage: 'Pourcentage', missing: 'Indisponible', details: 'Détails des données', navigate: 'Explorer les points',
    instructions: 'Les flèches gauche et droite changent le point. Haut et bas changent la série. Début et Fin sélectionnent le premier ou le dernier point. Entrée épingle les détails ; Échap les détache.',
    pinned: 'Épinglé', unpin: 'Détacher les détails', zoomIn: 'Agrandir', zoomOut: 'Réduire', resetZoom: 'Réinitialiser le zoom', themeError: 'Impossible de charger le thème.',
}
export const zh: Messages = {
    audio: '音频播放器', video: '视频播放器', play: '播放', pause: '暂停', stop: '停止', backward: '后退', forward: '前进', seek: '播放进度', volume: '音量', mute: '静音', unmute: '取消静音', rate: '播放速度',
    captions: '字幕', captionsOff: '关闭', fullscreen: '全屏', exitFullscreen: '退出全屏', mediaEmpty: '请选择媒体源。', mediaError: '无法播放媒体。', buffering: '缓冲中…', live: '直播',
    chart: '图表', loading: '加载中…', empty: '暂无数据。', noMatch: '没有可见数据。请显示一个系列或分段。', error: '无法加载图表。', retry: '重试', showAll: '全部显示', legend: '可见数据', table: '查看数据表',
    series: '系列', category: '类别', value: '数值', range: '范围', size: '大小', percentage: '百分比', missing: '不可用', details: '数据详情', navigate: '浏览数据点',
    instructions: '左右方向键切换数据点，上下方向键切换系列。Home 和 End 跳到第一个或最后一个数据点。Enter 固定详情，Escape 取消固定。',
    pinned: '已固定', unpin: '取消固定详情', zoomIn: '放大', zoomOut: '缩小', resetZoom: '重置缩放', themeError: '无法加载主题。',
}
const catalogs: Record<string, Messages> = { en, pt, es, fr, zh }
export function messages(locale: unknown, overrides: unknown): Messages {
    const base = catalogs[text(locale).toLowerCase().split(/[-_]/)[0]] ?? en
    const input = record(overrides)
    return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, text(input[key], value) || value])) as Messages
}
