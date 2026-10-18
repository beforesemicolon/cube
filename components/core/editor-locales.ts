/** Default UI copy is centralized; every string can be overridden through labels. */
export const editorEnglish = {
    action: 'Action', moreActions: 'More actions', menu: 'Menu', navigation: 'Navigation',
    previous: 'Previous page', next: 'Next page', page: 'Page {page}', pagination: 'Pagination',
    dismiss: 'Dismiss', selected: '{count} selected', commands: 'Search commands',
    noResults: 'No results', breadcrumb: 'Breadcrumb', expandPath: 'Show hidden ancestors',
    loading: 'Loading', help: 'Help', toolbar: 'Tools', choices: 'Choices', tabs: 'Views',
    untitled: 'Untitled', search: 'Search', clear: 'Clear', increase: 'Increase', decrease: 'Decrease',
    field: 'Value', choose: 'Choose an option', remove: 'Remove {label}', selectAll: 'Select all',
    file: 'Choose files', invalid: 'Check this value.', edit: 'Edit', save: 'Save', cancel: 'Cancel',
    reset: 'Reset', close: 'Close', open: 'Open', filter: 'Filter', rangeStart: 'Minimum', rangeEnd: 'Maximum',
    color: 'Color', opacity: 'Opacity', hue: 'Hue', saturation: 'Saturation', brightness: 'Brightness',
    copy: 'Copy', copied: 'Copied', noContent: 'No content', details: 'Details', theme: 'Theme',
    light: 'Light', dark: 'Dark', system: 'System', unit: 'Unit', shortcut: 'Keyboard shortcut', notifications: 'Notifications',
    name: 'Name', metadata: 'Path · status', fileRequirements: 'PNG, JPG, SVG or WebP · up to 10 MB',
} as const
export type EditorMessages = { [K in keyof typeof editorEnglish]: string }
const pt: EditorMessages = {
    action:'Ação',moreActions:'Mais ações',menu:'Menu',navigation:'Navegação',previous:'Página anterior',next:'Página seguinte',page:'Página {page}',pagination:'Paginação',dismiss:'Dispensar',selected:'{count} selecionados',commands:'Pesquisar comandos',noResults:'Sem resultados',breadcrumb:'Caminho de navegação',expandPath:'Mostrar antecessores ocultos',loading:'A carregar',help:'Ajuda',toolbar:'Ferramentas',choices:'Opções',tabs:'Vistas',untitled:'Sem título',search:'Pesquisar',clear:'Limpar',increase:'Aumentar',decrease:'Diminuir',field:'Valor',choose:'Escolha uma opção',remove:'Remover {label}',selectAll:'Selecionar tudo',file:'Escolher ficheiros',invalid:'Verifique este valor.',edit:'Editar',save:'Guardar',cancel:'Cancelar',reset:'Repor',close:'Fechar',open:'Abrir',filter:'Filtrar',rangeStart:'Mínimo',rangeEnd:'Máximo',color:'Cor',opacity:'Opacidade',hue:'Tonalidade',saturation:'Saturação',brightness:'Brilho',copy:'Copiar',copied:'Copiado',noContent:'Sem conteúdo',details:'Detalhes',theme:'Tema',light:'Claro',dark:'Escuro',system:'Sistema',unit:'Unidade',shortcut:'Atalho de teclado',notifications:'Notificações',name:'Nome',metadata:'Caminho · estado',fileRequirements:'PNG, JPG, SVG ou WebP · até 10 MB',
}
const es: EditorMessages = {
    action:'Acción',moreActions:'Más acciones',menu:'Menú',navigation:'Navegación',previous:'Página anterior',next:'Página siguiente',page:'Página {page}',pagination:'Paginación',dismiss:'Descartar',selected:'{count} seleccionados',commands:'Buscar comandos',noResults:'Sin resultados',breadcrumb:'Ruta de navegación',expandPath:'Mostrar antecesores ocultos',loading:'Cargando',help:'Ayuda',toolbar:'Herramientas',choices:'Opciones',tabs:'Vistas',untitled:'Sin título',search:'Buscar',clear:'Limpiar',increase:'Aumentar',decrease:'Disminuir',field:'Valor',choose:'Elige una opción',remove:'Quitar {label}',selectAll:'Seleccionar todo',file:'Elegir archivos',invalid:'Comprueba este valor.',edit:'Editar',save:'Guardar',cancel:'Cancelar',reset:'Restablecer',close:'Cerrar',open:'Abrir',filter:'Filtrar',rangeStart:'Mínimo',rangeEnd:'Máximo',color:'Color',opacity:'Opacidad',hue:'Tono',saturation:'Saturación',brightness:'Brillo',copy:'Copiar',copied:'Copiado',noContent:'Sin contenido',details:'Detalles',theme:'Tema',light:'Claro',dark:'Oscuro',system:'Sistema',unit:'Unidad',shortcut:'Atajo de teclado',notifications:'Notificaciones',name:'Nombre',metadata:'Ruta · estado',fileRequirements:'PNG, JPG, SVG o WebP · hasta 10 MB',
}
const fr: EditorMessages = {
    action:'Action',moreActions:'Plus d’actions',menu:'Menu',navigation:'Navigation',previous:'Page précédente',next:'Page suivante',page:'Page {page}',pagination:'Pagination',dismiss:'Fermer',selected:'{count} sélectionnés',commands:'Rechercher une commande',noResults:'Aucun résultat',breadcrumb:'Fil d’Ariane',expandPath:'Afficher les ancêtres masqués',loading:'Chargement',help:'Aide',toolbar:'Outils',choices:'Options',tabs:'Vues',untitled:'Sans titre',search:'Rechercher',clear:'Effacer',increase:'Augmenter',decrease:'Diminuer',field:'Valeur',choose:'Choisir une option',remove:'Retirer {label}',selectAll:'Tout sélectionner',file:'Choisir des fichiers',invalid:'Vérifiez cette valeur.',edit:'Modifier',save:'Enregistrer',cancel:'Annuler',reset:'Réinitialiser',close:'Fermer',open:'Ouvrir',filter:'Filtrer',rangeStart:'Minimum',rangeEnd:'Maximum',color:'Couleur',opacity:'Opacité',hue:'Teinte',saturation:'Saturation',brightness:'Luminosité',copy:'Copier',copied:'Copié',noContent:'Aucun contenu',details:'Détails',theme:'Thème',light:'Clair',dark:'Sombre',system:'Système',unit:'Unité',shortcut:'Raccourci clavier',notifications:'Notifications',name:'Nom',metadata:'Chemin · état',fileRequirements:'PNG, JPG, SVG ou WebP · 10 Mo maximum',
}
const zh: EditorMessages = {
    action:'操作',moreActions:'更多操作',menu:'菜单',navigation:'导航',previous:'上一页',next:'下一页',page:'第 {page} 页',pagination:'分页',dismiss:'关闭',selected:'已选择 {count} 项',commands:'搜索命令',noResults:'没有结果',breadcrumb:'导航路径',expandPath:'显示隐藏的上级',loading:'加载中',help:'帮助',toolbar:'工具',choices:'选项',tabs:'视图',untitled:'未命名',search:'搜索',clear:'清除',increase:'增加',decrease:'减少',field:'数值',choose:'选择一个选项',remove:'移除 {label}',selectAll:'全选',file:'选择文件',invalid:'请检查此值。',edit:'编辑',save:'保存',cancel:'取消',reset:'重置',close:'关闭',open:'打开',filter:'筛选',rangeStart:'最小值',rangeEnd:'最大值',color:'颜色',opacity:'不透明度',hue:'色相',saturation:'饱和度',brightness:'亮度',copy:'复制',copied:'已复制',noContent:'没有内容',details:'详情',theme:'主题',light:'浅色',dark:'深色',system:'系统',unit:'单位',shortcut:'键盘快捷键',notifications:'通知',name:'名称',metadata:'路径 · 状态',fileRequirements:'PNG、JPG、SVG 或 WebP · 最大 10 MB',
}
export const editorCatalogs: Record<string, EditorMessages> = { en: editorEnglish, pt, es, fr, zh }
export function editorMessage(locale: unknown, overrides: unknown, key: keyof EditorMessages, values: Record<string,string|number> = {}): string {
    const catalog = editorCatalogs[String(locale ?? 'en').toLowerCase().split(/[-_]/)[0]] ?? editorEnglish
    const override = overrides && typeof overrides === 'object' ? Reflect.get(overrides, key) : undefined
    const template = typeof override === 'string' ? override : catalog[key]
    return template.replace(/\{([a-zA-Z]+)\}/g, (token, name: string) => Object.hasOwn(values, name) ? String(values[name]) : token)
}
