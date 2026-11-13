import { expect } from '@playwright/test'
import type { Col } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-col', 'layout--col', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"reverse":true} satisfies Partial<Col>) })
    await expect(host).toHaveCSS("flex-direction", "column-reverse")

    await host.evaluate(node => {
        node.replaceChildren(
            Object.assign(document.createElement('span'), { textContent: 'One' }),
            Object.assign(document.createElement('span'), { textContent: 'Two' }),
        )
        Object.assign(node, { reverse: false, gap: 'md' } satisfies Partial<Col>)
    })
    const colGap = await host.evaluate(node => {
        const [first, second] = Array.from(node.children)
        return second.getBoundingClientRect().top - first.getBoundingClientRect().bottom
    })
    expect(colGap).toBe(12)
})
