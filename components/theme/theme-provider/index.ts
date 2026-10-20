import componentStylesheet from './styles.css?inline'
import { type Template, html } from '../../core/runtime.js'
import { ThemeProviderBase } from './ThemeProviderBase.js';
export class ThemeProvider extends ThemeProviderBase {
    stylesheet = componentStylesheet
    render(): Template {
        return html`<slot part="content"></slot>`
    }
}
export { ThemeProviderBase };
export type { ThemeProviderProps } from './ThemeProviderBase.js';
