import { type Template, html } from '../../core/runtime.js'
import { ThemeProviderBase } from './ThemeProviderBase.js';
export class ThemeProvider extends ThemeProviderBase {
    stylesheet = ':host{display:contents}'
    render(): Template {
        return html`<slot part="content"></slot>`
    }
}
export { ThemeProviderBase };
export type { ThemeProviderProps } from './ThemeProviderBase.js';
