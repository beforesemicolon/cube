/** Safe to import before a DOM exists. Each lazy entry registers itself when loaded. */
export const componentLoaders = {
    'button': () => import('./actions/button/index.js'),
    'icon-button': () => import('./actions/icon-button/index.js'),
    'toggle-button': () => import('./actions/toggle-button/index.js'),
    'link': () => import('./actions/link/index.js'),
    'link-button': () => import('./actions/link-button/index.js'),
    'icon': () => import('./icons/icon/index.js'),
    'slider': () => import('./inputs/slider/index.js'),
    'select': () => import('./inputs/select/index.js'),
    'audio-player': () => import('./media/audio-player/index.js'),
    'video-player': () => import('./media/video-player/index.js'),
    'cartesian-chart': () => import('./charts/cartesian-chart/index.js'),
    'pie-chart': () => import('./charts/pie-chart/index.js'),
    'theme-provider': () => import('./theme/theme-provider/index.js'),
} as const
export type ComponentName = keyof typeof componentLoaders
export const componentNames = Object.keys(componentLoaders) as ComponentName[]
