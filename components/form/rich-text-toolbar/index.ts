import { register } from '../../core/Component.js'
import { html, repeat, type Template } from '../../core/runtime.js'
import { richTextFormats, type RichTextFormat } from '../rich-text-editor/model.js'
import { RichTextToolbarBase } from './RichTextToolbarBase.js'
import styles from './styles.css?inline'

export interface RichTextFormatDetail { format: RichTextFormat; originalEvent: Event }
export class RichTextToolbar extends RichTextToolbarBase {
    stylesheet = styles
    private keepSelection = (event: PointerEvent): void => { if (event.button === 0) event.preventDefault(); event.stopPropagation() }
    private contain = (event: Event): void => { event.stopPropagation() }
    render(): Template {
        return html`<cb-toolbar part="toolbar" exportparts="toolbar:toolbar-control" accessible-label=${this.accessibleName}
            onpointerdown=${this.keepSelection} onbeforeaction=${this.contain} onaction=${this.contain}>
            ${repeat(richTextFormats, format => html`<cb-button part=${`format format-${format}`} data-format=${format}
                exportparts="control:format-control,label:format-label,button-label:format-label,icon:format-icon"
                variant="ghost" size="xs" icon-only icon=${format} accessible-label=${this.props[`${format}Label`]}
                title=${this.props[`${format}Label`]} disabled=${() => this.unavailable}
                pressed=${() => (this.props.activeFormats?.() ?? []).includes(format)} onbeforechange=${this.contain}
                onchange=${(event: CustomEvent<{ originalEvent: Event }>) => {
                    event.stopPropagation()
                    if (!this.unavailable) this.emit('format', { format, originalEvent: event.detail.originalEvent } satisfies RichTextFormatDetail)
                }}></cb-button>`)}
            <slot></slot>
        </cb-toolbar>`
    }
}
export { RichTextToolbarBase }
export type { RichTextToolbarProps } from './RichTextToolbarBase.js'
register('cb-rich-text-toolbar', RichTextToolbar)
