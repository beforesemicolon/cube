import { ChartBase, type ChartProps } from '../ChartBase.js'
import { cartesianModel, type CartesianOptions, type Axis, type Series, type ChartSkin } from '../model.js'
export interface CartesianChartProps extends ChartProps, CartesianOptions {}
export abstract class CartesianChartBase extends ChartBase<CartesianChartProps> {
    static observedAttributes = [...ChartBase.observedAttributes, 'series', 'x-axis', 'y-axis', 'inverted', 'stacking']
    series: Series[] = []; xAxis: Axis = {}; yAxis: Axis | Axis[] = {}; inverted = false; stacking: 'normal' | false = false
    get kind() { return 'cartesian' as const }
    protected build(skin: ChartSkin, visible?: ReadonlySet<string>) { return cartesianModel(this, skin, visible) }
}
