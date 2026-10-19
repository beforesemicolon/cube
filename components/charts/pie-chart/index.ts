import { css as componentStyles, type Template } from '../../core/runtime.js'
import {  ChartView , chartCSS } from '../view.js';
import { PieChartBase } from './PieChartBase.js';
export class PieChart extends PieChartBase {
    stylesheet = componentStyles`${chartCSS}`

    private view?: ChartView;
    render(): Template { this.view = new ChartView(this); return this.view.root; }
    protected mount(): void { this.view?.mount(); }
    protected display(): void { this.view?.refresh(); }
    protected unmount(): void { this.view?.destroy(); }
}
export { PieChartBase };
export type { PieChartProps } from './PieChartBase.js';
