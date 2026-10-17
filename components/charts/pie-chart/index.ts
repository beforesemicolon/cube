import { register } from '../../core/Component.js'
import { ChartView } from '../view.js'
import { PieChartBase } from './PieChartBase.js'
export class PieChart extends PieChartBase {
    private view?: ChartView
    render(): Node { this.view = new ChartView(this); return this.view.root }
    protected mount(): void { this.view?.mount() }
    protected display(): void { this.view?.refresh() }
    protected unmount(): void { this.view?.destroy() }
}
register('cb-pie-chart', PieChart)
export { PieChartBase }
export type { PieChartProps } from './PieChartBase.js'
