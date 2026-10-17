export * from './theme/tokens.js'
export * from './locales/index.js'
export * from './media/controller.js'
export * from './charts/model.js'
export * from './charts/engine.js'
export type { AudioPlayer } from './media/audio-player/index.js'
export type { VideoPlayer } from './media/video-player/index.js'
export type { CartesianChart } from './charts/cartesian-chart/index.js'
export type { PieChart } from './charts/pie-chart/index.js'
const loaders = {
    'theme-provider': () => import('./theme/theme-provider/index.js'),
    'audio-player': () => import('./media/audio-player/index.js'),
    'video-player': () => import('./media/video-player/index.js'),
    'cartesian-chart': () => import('./charts/cartesian-chart/index.js'),
    'pie-chart': () => import('./charts/pie-chart/index.js'),
}
export type ComponentName = keyof typeof loaders
/** SSR-safe to import; mounting/registration requires the browser's DOM. */
export async function loadComponent(name: ComponentName): Promise<CustomElementConstructor> {
    if (typeof customElements === 'undefined') throw new Error('Cube element loading requires a DOM; import pure utilities on the server')
    if (!Object.hasOwn(loaders, name)) throw new TypeError(`Unknown Cube component: ${name}`)
    await loaders[name]()
    return customElements.get(`cb-${name}`)!
}
