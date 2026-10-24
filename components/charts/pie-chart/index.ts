import { register } from '../../core/Component.js'
import componentStylesheet from '../view.css?inline'
import { type Template } from '../../core/runtime.js'
import { ChartView } from '../view.js'
import { PieChartBase } from './PieChartBase.js';
export class PieChart extends PieChartBase {
    stylesheet = componentStylesheet

    private view?: ChartView;
    render(): Template { this.view = new ChartView(this); return this.view.root; }
    protected mount(): void { this.view?.mount(); }
    protected display(): void { this.view?.refresh(); }
    protected unmount(): void { this.view?.destroy(); }
}
export { PieChartBase };
export type { PieChartProps } from './PieChartBase.js';

register('cb-pie-chart', PieChart)
