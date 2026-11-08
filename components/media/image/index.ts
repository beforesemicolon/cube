import { register } from '../../core/Component.js'
import { html, is, isNot, state, when, type Template } from '../../core/runtime.js'
import { scalarText } from '../../core/value.js'
import componentStylesheet from './styles.css?inline'
import { ImageBase, type ImageDecoding, type ImageFit, type ImageLoading } from './ImageBase.js'

type ImageStatus = 'empty' | 'loading' | 'loaded' | 'error'

export class Image extends ImageBase {
    stylesheet = componentStylesheet

    private readonly activeSource = state('')
    private readonly status = state<ImageStatus>('empty')
    private readonly customFallback = state(false)
    private sourceKey = ''

    render(): Template {
        return html`${when(this.activeSource[0], this.imageTemplate)}
        ${when(
            is(this.status[0], 'loading'),
            html`<span
                part="loading"
                role="status"
                aria-label="${this.props.loadingLabel}"
                ><span part="spinner" aria-hidden="true"></span
            ></span>`
        )}
        ${when(
            is(this.status[0], 'error'),
            this.fallbackTemplate
        )}
        ${when(
            is(this.status[0], 'empty'),
            this.fallbackTemplate
        )}`
    }

    protected syncView(): void {
        const sourceKey = `${scalarText(this.src)}\u0000${scalarText(this.fallbackSrc)}`
        if (sourceKey !== this.sourceKey) {
            this.sourceKey = sourceKey
            this.activeSource[1](this.source())
            this.status[1](this.source() ? 'loading' : 'empty')
        }
        this.dataset.variant = this.variant === 'thumbnail' ? 'thumbnail' : 'image'
        this.style.setProperty('--component-image-fit', this.normalizedFit())
        this.style.setProperty('--component-image-position', scalarText(this.position) || 'center')
        this.setOptionalStyle('--component-image-width', this.width)
        this.setOptionalStyle('--component-image-height', this.height)
        this.setOptionalStyle('--component-image-aspect-ratio', this.aspectRatio)
    }

    protected mount(): void {
        const slot = this.refs.fallbackSlot?.[0]
        if (slot instanceof HTMLSlotElement) {
            this.listen(slot, 'slotchange', this.syncCustomFallback)
            this.syncCustomFallback()
        }
        super.mount()
    }

    private setOptionalStyle(name: string, value: string): void {
        const normalized = scalarText(value)
        if (normalized) this.style.setProperty(name, normalized)
        else this.style.removeProperty(name)
    }

    private normalizedLoading = (): ImageLoading =>
        this.loading === 'eager' ? 'eager' : 'lazy'

    private normalizedDecoding = (): ImageDecoding =>
        ['auto', 'sync', 'async'].includes(this.decoding)
            ? this.decoding
            : 'async'

    private normalizedFit = (): ImageFit =>
        ['contain', 'cover', 'fill', 'none', 'scale-down'].includes(this.fit)
            ? this.fit
            : 'cover'

    private imageTemplate = (): Template => html`<img
        part="image"
        src="${this.activeSource[0]}"
        alt="${this.props.alt}"
        loading="${this.normalizedLoading}"
        decoding="${this.normalizedDecoding}"
        hidden="${isNot(is(this.status[0], 'loaded'))}"
        onload="${this.handleLoad}"
        onerror="${this.handleError}"
    />`

    private fallbackTemplate = (): Template => html`<span
        part="fallback"
        role="${() => (scalarText(this.alt) ? 'img' : null)}"
        aria-label="${() => scalarText(this.alt) || null}"
        aria-hidden="${() => (scalarText(this.alt) ? null : true)}"
        title="${this.props.errorLabel}"
        ><slot ref="fallbackSlot"></slot
        ><cb-icon
            part="fallback-icon"
            name="${this.props.fallbackIcon}"
            hidden="${this.customFallback[0]}"
            aria-hidden="true"
        ></cb-icon
    ></span>`

    private syncCustomFallback = (): void => {
        const slot = this.refs.fallbackSlot?.[0]
        if (!(slot instanceof HTMLSlotElement)) return
        this.customFallback[1](
            slot
                .assignedNodes()
                .some(
                    (node) =>
                        node.nodeType === Node.ELEMENT_NODE ||
                        Boolean(node.textContent?.trim())
                )
        )
    }

    private handleLoad = (event: Event): void => {
        this.status[1]('loaded')
        this.emit('load', {
            src: this.activeSource[0](),
            originalEvent: event,
        })
    }

    private handleError = (event: Event): void => {
        const failedSource = this.activeSource[0]()
        const fallbackSource = scalarText(this.fallbackSrc)
        const willFallback = Boolean(
            fallbackSource && fallbackSource !== failedSource
        )
        this.emit('error', {
            src: failedSource,
            fallbackSrc: fallbackSource,
            willFallback,
            originalEvent: event,
        })
        if (willFallback) {
            this.activeSource[1](fallbackSource)
            this.status[1]('loading')
            return
        }
        this.activeSource[1]('')
        this.status[1]('error')
    }
}

export { ImageBase }
export type {
    ImageProps,
    ImageLoading,
    ImageDecoding,
    ImageFit,
    ImageVariant,
} from './ImageBase.js'

register('cb-image', Image)
