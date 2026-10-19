import { register } from '../../core/Component.js'
import { editorCSS, el, fragment, sheet, slot } from '../../core/editor-dom.js'
import { scalarText } from '../../core/value.js'
import { HeadingBase, type HeadingVariant } from './HeadingBase.js'

const variants: readonly HeadingVariant[] = ['h2', 'h3', 'h4', 'h5', 'h6']

export class Heading extends HeadingBase {
    private container?: HTMLElement
    private heading?: HTMLHeadingElement
    private content?: HTMLSlotElement
    private descriptionNode?: HTMLParagraphElement
    render(): Node {
        this.container = el('div', 'root')
        this.descriptionNode = el('p', 'description') as HTMLParagraphElement
        this.descriptionNode.dataset.cbDescription = ''
        this.container.append(this.descriptionNode)
        return fragment(sheet(editorCSS + `
:host{display:block}[part~=root]{display:contents}[part~=heading],[part~=description]{margin:0}
:host([data-size=xs]) [part~=heading]{font-size:var(--component-heading-font-size-xs,.875rem)}
:host([data-size=sm]) [part~=heading]{font-size:var(--component-heading-font-size-sm,1rem)}
:host([data-size=md]) [part~=heading]{font-size:var(--component-heading-font-size-md,1.25rem)}
:host([data-size=lg]) [part~=heading]{font-size:var(--component-heading-font-size-lg,1.5rem)}
[part~=heading]{font-family:var(--typography-heading-font-family,inherit);font-weight:var(--typography-heading-font-weight,700);line-height:var(--typography-heading-line-height,1.2)}
[part~=description]{margin-block-start:var(--spacing-xs,4px);color:var(--color-muted-foreground);font-size:var(--component-body-font-size,1rem)}
`), this.container)
    }
    protected syncView(): void {
        if (!this.container || !this.descriptionNode) return
        const variant = variants.includes(this.variant) ? this.variant : 'h2'
        if (!this.heading || this.heading.localName !== variant) {
            const heading = el(variant, 'heading') as HTMLHeadingElement
            this.content = slot('', scalarText(this.label), 'content')
            heading.append(this.content)
            this.heading?.remove()
            this.heading = heading
            this.container.prepend(heading)
        }
        if (this.content) this.content.textContent = scalarText(this.label)
        const description = scalarText(this.description)
        this.descriptionNode.textContent = description
        this.descriptionNode.hidden = !description
    }
}

register('cb-heading', Heading)
export { HeadingBase }
export type { HeadingProps, HeadingVariant } from './HeadingBase.js'
