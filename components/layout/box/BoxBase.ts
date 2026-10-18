import { Component, type CommonProps } from '../../core/Component.js'
import { scalarText } from '../../core/value.js'

export interface BoxProps extends CommonProps {
    inlineSize?: string
    blockSize?: string
    minInlineSize?: string
    maxInlineSize?: string
    minBlockSize?: string
    maxBlockSize?: string
    padding?: string
    margin?: string
    gap?: string
    background?: string
    border?: string
    radius?: string
    overflow?: string
}

const properties: ReadonlyArray<readonly [keyof BoxProps, keyof CSSStyleDeclaration]> = [
    ['inlineSize', 'inlineSize'],
    ['blockSize', 'blockSize'],
    ['minInlineSize', 'minInlineSize'],
    ['maxInlineSize', 'maxInlineSize'],
    ['minBlockSize', 'minBlockSize'],
    ['maxBlockSize', 'maxBlockSize'],
    ['padding', 'padding'],
    ['margin', 'margin'],
    ['gap', 'gap'],
    ['background', 'background'],
    ['border', 'border'],
    ['radius', 'borderRadius'],
    ['overflow', 'overflow'],
]

/** Shared sizing and surface behavior without choosing a rendered child element. */
export abstract class BoxBase<P extends BoxProps = BoxProps> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'inline-size',
        'block-size',
        'min-inline-size',
        'max-inline-size',
        'min-block-size',
        'max-block-size',
        'padding',
        'margin',
        'gap',
        'background',
        'border',
        'radius',
        'overflow',
    ]

    inlineSize = ''
    blockSize = ''
    minInlineSize = ''
    maxInlineSize = ''
    minBlockSize = ''
    maxBlockSize = ''
    padding = ''
    margin = ''
    gap = ''
    background = ''
    border = ''
    radius = ''
    overflow = ''

    protected syncLayout(): void {
        for (const [property, cssProperty] of properties) {
            const value = scalarText(this[property])
            if (value) this.style.setProperty(String(cssProperty).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`), value)
            else this.style.removeProperty(String(cssProperty).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`))
        }
    }

    protected mount(): void { this.syncLayout() }
    protected update(): void { this.syncLayout() }
}
