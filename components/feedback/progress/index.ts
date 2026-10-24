import { register } from '../../core/Component.js'
import componentStylesheet from './styles.css?inline'
import { type Template } from '../../core/runtime.js'
import { progressView } from '../view.js'
import { ProgressBase } from './ProgressBase.js';
export class Progress extends ProgressBase {
    stylesheet = componentStylesheet

    render(): Template { return progressView(this); }
}
export { ProgressBase };
export type { ProgressProps } from './ProgressBase.js';

register('cb-progress', Progress)
