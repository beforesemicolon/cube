import { ChartBase, type ChartProps } from '../ChartBase.js'
import { pieModel, type PieOptions, type PieSeries, type ChartSkin } from '../model.js'
export interface PieChartProps extends ChartProps, PieOptions {}
export abstract class PieChartBase extends ChartBase<PieChartProps> {
    static observedAttributes = [...ChartBase.observedAttributes, 'series', 'variant', 'inner-title', 'inner-description']
    series: PieSeries | null = null; variant: 'pie' | 'donut' | undefined = undefined; innerTitle = ''; innerDescription = ''
    get kind() { return 'pie' as const }
    protected build(skin: ChartSkin, visible?: ReadonlySet<string>) { return pieModel(this, skin, visible) }
}
