import componentStylesheet from '../view.css?inline'
import { type Template } from '../../core/runtime.js'
import { ChartView } from '../view.js'
import { CartesianChartBase } from './CartesianChartBase.js';
export class CartesianChart extends CartesianChartBase {
    stylesheet = componentStylesheet

    private view?: ChartView;
    render(): Template { this.view = new ChartView(this); return this.view.root; }
    protected mount(): void { this.view?.mount(); }
    protected display(): void { this.view?.refresh(); }
    protected unmount(): void { this.view?.destroy(); }
}
export { CartesianChartBase };
export type { CartesianChartProps } from './CartesianChartBase.js';
