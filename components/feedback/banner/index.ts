import componentStylesheet from './styles.css?inline'
import { type Template } from '../../core/runtime.js'
import { messageView } from '../view.js'
import { BannerBase } from './BannerBase.js';
export class Banner extends BannerBase {
    stylesheet = componentStylesheet

    render(): Template { return messageView(this, 'banner'); }
}
export { BannerBase };
export type { BannerProps } from './BannerBase.js';
