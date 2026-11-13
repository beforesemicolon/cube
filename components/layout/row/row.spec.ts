import { expect } from '@playwright/test'
import type { Row } from './index.js'
import { componentContract } from '../../../tests/component-contract.js'

componentContract('cb-row', 'layout--row', async ({ host }) => {
    await host.evaluate(node => { Object.assign(node, {"reverse":true} satisfies Partial<Row>) })
    await expect(host).toHaveCSS("flex-direction", "row-reverse")

    await host.evaluate(node => {
        Object.assign(node, {
            alignItems: 'center',
            spacing: 'apart',
        } satisfies Partial<Row>)
    })
    await expect(host).toHaveCSS('align-items', 'center')
    await expect(host).toHaveCSS('justify-content', 'space-between')

    await host.evaluate(node => {
        node.replaceChildren(
            Object.assign(document.createElement('span'), { textContent: 'One' }),
            Object.assign(document.createElement('span'), { textContent: 'Two' }),
        )
        node.removeAttribute('reverse')
        node.removeAttribute('spacing')
        node.setAttribute('gap', 'md')
    })
    const rowGap = await host.evaluate(node => {
        const [first, second] = Array.from(node.children)
        return second.getBoundingClientRect().left - first.getBoundingClientRect().right
    })
    expect(rowGap).toBe(12)
})
