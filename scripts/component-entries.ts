export const componentEntries = [
    {path:'actions/button',name:'button',className:'Button'},
    {path:'actions/icon-button',name:'icon-button',className:'IconButton'},
    {path:'actions/toggle-button',name:'toggle-button',className:'ToggleButton'},
    {path:'actions/link',name:'link',className:'Link'},
    {path:'actions/link-button',name:'link-button',className:'LinkButton'},
    {path:'icons/icon',name:'icon',className:'Icon'},
    {path:'inputs/slider',name:'slider',className:'Slider'},
    {path:'inputs/select',name:'select',className:'Select'},
    {path:'media/audio-player',name:'audio-player',className:'AudioPlayer'},
    {path:'media/video-player',name:'video-player',className:'VideoPlayer'},
    {path:'charts/cartesian-chart',name:'cartesian-chart',className:'CartesianChart'},
    {path:'charts/pie-chart',name:'pie-chart',className:'PieChart'},
    {path:'theme/theme-provider',name:'theme-provider',className:'ThemeProvider'},
] as const
export const componentGroups = ['actions','icons','inputs','media','charts','theme'] as const
