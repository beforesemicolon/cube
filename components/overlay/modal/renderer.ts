import { Component, register } from '../../core/Component.js'
import { html, type Template } from '../../core/runtime.js'
import componentStylesheet from './renderer.css?inline'

/** Stable application mount point for modals created by the global service. */
export class ModalRenderer extends Component {
    static observedAttributes: string[] = []

    stylesheet = componentStylesheet

    render(): Template {
        return html`<slot></slot>`
    }
}

register('cb-modal-renderer', ModalRenderer)
