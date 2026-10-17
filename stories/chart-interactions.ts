import { expect,userEvent,waitFor } from 'storybook/test'
/** Exercises the same Cube toggle used by all chart legends and restores the initial display. */
export async function exerciseChart(canvasElement:HTMLElement):Promise<void>{
    const chart=canvasElement.querySelector('cb-cartesian-chart,cb-pie-chart') as HTMLElement
    await waitFor(()=>expect(chart.shadowRoot?.querySelector('[part=plot] svg')).toBeTruthy(),{timeout:10000})
    const legend=chart.shadowRoot!.querySelector('[part=legend-item]')!
    const control=legend.shadowRoot!.querySelector('button')!
    await expect(control).toHaveAttribute('aria-pressed','true')
    await userEvent.click(control)
    await waitFor(()=>expect(control).toHaveAttribute('aria-pressed','false'))
    await userEvent.click(control)
    await waitFor(()=>expect(control).toHaveAttribute('aria-pressed','true'))
    await waitFor(()=>expect(chart.shadowRoot!.querySelector('[part=plot]')).toBeVisible())
    chart.dataset.storyReady='true'
}
