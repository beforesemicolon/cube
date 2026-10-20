import type { ChartEngine } from './engine.js'
/** Package imports are lazy. The CDN build substitutes a global-runtime adapter. */
export async function loadECharts(): Promise<ChartEngine> {
    const engine: unknown = await import('echarts')
    return engine as ChartEngine
}
