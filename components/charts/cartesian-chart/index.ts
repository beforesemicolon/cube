import { type Template, html } from '../../core/runtime.js'
import { ChartView } from '../view.js';
import { CartesianChartBase } from './CartesianChartBase.js';
export class CartesianChart extends CartesianChartBase {
    private view?: ChartView;
    render(): Template { this.view = new ChartView(this); return html`${this.view.root}`; }
    protected mount(): void { this.view?.mount(); }
    protected display(): void { this.view?.refresh(); }
    protected unmount(): void { this.view?.destroy(); }
}
export { CartesianChartBase };
export type { CartesianChartProps } from './CartesianChartBase.js';
