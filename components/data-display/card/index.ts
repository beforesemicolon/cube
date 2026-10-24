import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { html, type Template } from '../../core/runtime.js'

import { CardBase } from './CardBase.js';
export class Card extends CardBase {
    stylesheet = componentStylesheet

    render(): Template { return html`<slot part="content"></slot>` }
}
export { CardBase };
export type { CardProps } from './CardBase.js';

register('cb-card', Card)
