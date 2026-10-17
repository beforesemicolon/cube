import { register } from '../../core/Component.js'
import { sheet } from '../../core/dom.js'
import { ThemeProviderBase } from './ThemeProviderBase.js'
export class ThemeProvider extends ThemeProviderBase {
    render(): Node {
        const fragment = document.createDocumentFragment()
        const slot = document.createElement('slot'); slot.setAttribute('part', 'content')
        fragment.append(sheet(':host{display:contents}'), slot)
        return fragment
    }
}
register('cb-theme-provider', ThemeProvider)
export { ThemeProviderBase }
export type { ThemeProviderProps } from './ThemeProviderBase.js'
