import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { AICommandBase } from './AICommandBase.js'

export class AICommand extends AICommandBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-ai-command', AICommand)
export { AICommandBase }
export type { AICommandProps } from './AICommandBase.js'
