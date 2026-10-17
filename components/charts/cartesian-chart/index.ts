import { register } from '../../core/Component.js'
import { ChartView } from '../view.js'
import { CartesianChartBase } from './CartesianChartBase.js'
export class CartesianChart extends CartesianChartBase {
    private view?: ChartView
    render(): Node { this.view = new ChartView(this); return this.view.root }
    protected mount(): void { this.view?.mount() }
    protected display(): void { this.view?.refresh() }
    protected unmount(): void { this.view?.destroy() }
}
register('cb-cartesian-chart', CartesianChart)
export { CartesianChartBase }
export type { CartesianChartProps } from './CartesianChartBase.js'
