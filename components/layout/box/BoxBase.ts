import { Component, type CommonProps } from '../../core/Component.js'
import { bool, scalarText } from '../../core/value.js'

export interface BoxProps extends CommonProps {
    inline?: boolean
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
    shadow?: string
    overflow?: string
    /** Physical aliases retained for easy adoption by existing applications. */
    width?: string
    height?: string
    minWidth?: string
    maxWidth?: string
    minHeight?: string
    maxHeight?: string
    bg?: string
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
    ['shadow', 'boxShadow'],
    ['overflow', 'overflow'],
]

const aliases: ReadonlyArray<readonly [keyof BoxProps, keyof BoxProps, keyof CSSStyleDeclaration]> = [
    ['width', 'inlineSize', 'inlineSize'],
    ['height', 'blockSize', 'blockSize'],
    ['minWidth', 'minInlineSize', 'minInlineSize'],
    ['maxWidth', 'maxInlineSize', 'maxInlineSize'],
    ['minHeight', 'minBlockSize', 'minBlockSize'],
    ['maxHeight', 'maxBlockSize', 'maxBlockSize'],
    ['bg', 'background', 'background'],
]

const spacingScale: Readonly<Record<string, string>> = {
    none: '0',
    xs: 'var(--spacing-xs,4px)',
    s: 'var(--spacing-sm,8px)',
    sm: 'var(--spacing-sm,8px)',
    m: 'var(--spacing-md,12px)',
    md: 'var(--spacing-md,12px)',
    l: 'var(--spacing-lg,16px)',
    lg: 'var(--spacing-lg,16px)',
    xl: 'var(--spacing-xl,24px)',
    '2xl': 'var(--spacing-2xl,32px)',
    '3xl': 'var(--spacing-3xl,48px)',
}

export function layoutSpacing(value: string): string {
    const normalized = scalarText(value)
    return spacingScale[normalized] ?? normalized
}

function cssName(property: keyof CSSStyleDeclaration): string {
    return String(property).replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

/** Shared sizing and surface behavior without choosing a rendered child element. */
export abstract class BoxBase<P extends BoxProps = BoxProps> extends Component<P> {
    static observedAttributes = [
        ...Component.observedAttributes,
        'inline',
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
        'shadow',
        'overflow',
        'width',
        'height',
        'min-width',
        'max-width',
        'min-height',
        'max-height',
        'bg',
    ]

    inline = false
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
    shadow = ''
    overflow = ''
    width = ''
    height = ''
    minWidth = ''
    maxWidth = ''
    minHeight = ''
    maxHeight = ''
    bg = ''

    protected syncLayout(): void {
        for (const [property, cssProperty] of properties) {
            const rawValue = scalarText(this[property])
            const value = property === 'gap' ? layoutSpacing(rawValue) : rawValue
            if (value) this.style.setProperty(cssName(cssProperty), value)
            else this.style.removeProperty(cssName(cssProperty))
        }
        for (const [alias, canonical, cssProperty] of aliases) {
            const canonicalValue = scalarText(this[canonical])
            const aliasValue = scalarText(this[alias])
            if (!canonicalValue && aliasValue) this.style.setProperty(cssName(cssProperty), aliasValue)
            else if (!canonicalValue) this.style.removeProperty(cssName(cssProperty))
        }
        this.toggleAttribute('data-inline', bool(this.inline))
    }

    protected mount(): void { this.syncLayout() }
    protected update(): void { this.syncLayout() }
}
