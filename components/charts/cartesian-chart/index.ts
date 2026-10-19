import { css as componentStyles, type Template } from '../../core/runtime.js'
import {  ChartView , chartCSS } from '../view.js';
import { CartesianChartBase } from './CartesianChartBase.js';
export class CartesianChart extends CartesianChartBase {
    stylesheet = componentStyles`${chartCSS}`

    private view?: ChartView;
    render(): Template { this.view = new ChartView(this); return this.view.root; }
    protected mount(): void { this.view?.mount(); }
    protected display(): void { this.view?.refresh(); }
    protected unmount(): void { this.view?.destroy(); }
}
export { CartesianChartBase };
export type { CartesianChartProps } from './CartesianChartBase.js';
