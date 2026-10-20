import { loadECharts } from './load-echarts.js'
export interface ChartInstance {
    setOption(option: unknown, options?: { notMerge?: boolean; lazyUpdate?: boolean }): void
    resize(): void; dispose(): void; dispatchAction(action: Record<string, unknown>): void
    on(event: string, listener: (event: unknown) => void): void
}
export interface ChartEngine { init(element: HTMLElement, theme?: unknown, options?: { renderer?: 'svg' | 'canvas' }): ChartInstance }
interface EngineState { loader: () => Promise<ChartEngine>; pending?: Promise<ChartEngine> }
const key = Symbol.for('@beforesemicolon/cube/chart-engine')
const globals = globalThis as typeof globalThis & { [key]?: EngineState }
const state = globals[key] ??= { loader: loadECharts }
/** Configure before mounting charts. Shared by independently loaded Cube CDN bundles. */
export function configureChartEngine(next: () => Promise<ChartEngine>): void { state.loader = next; state.pending = undefined }
export function chartEngine(): Promise<ChartEngine> {
    if (!state.pending) {
        const loader = state.loader
        const pending = Promise.resolve().then(loader).then(engine => {
            if (typeof engine?.init !== 'function') throw new TypeError('Invalid chart engine')
            return engine
        }).catch(error => { if (state.pending === pending) state.pending = undefined; throw error })
        state.pending = pending
    }
    return state.pending
}
