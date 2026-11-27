import { register } from '../../core/Component.js'
import { html, repeat, type Template } from '../../core/runtime.js'
import { ProgressStepsBase } from './ProgressStepsBase.js'
import componentStylesheet from './styles.css?inline'

export class ProgressSteps extends ProgressStepsBase {
    stylesheet = componentStylesheet

    render(): Template {
        return html`<nav part="navigation" aria-label="${this.progressName}" data-variant="${this.progressVariant}">
            <ol part="steps" role="list">
                ${repeat(
                    () => this.indices,
                    (index) => html`<li>
                        <cb-button part="target" exportparts="control" data-bare icon-only="true" type="button"
                            accessible-label="${() => this.labelForStep(index)}"
                            aria-current="${() => index === this.currentIndex ? 'step' : null}"
                            data-state="${() => index < this.currentIndex ? 'complete' : index === this.currentIndex ? 'current' : 'pending'}"
                            disabled="${() => this.isStepDisabled(index)}"
                            onbeforeaction="${(event: Event) => event.stopPropagation()}"
                            onaction="${(event: Event) => this.activateStep(index, event)}">
                            <span part="dot" slot="prefix" aria-hidden="true"></span>
                        </cb-button>
                    </li>`,
                    { key: (index) => index }
                )}
            </ol>
        </nav>`
    }
}

export { ProgressStepsBase }
export type { ProgressStepsClickDetail, ProgressStepsProps, ProgressStepsVariant } from './ProgressStepsBase.js'

register('cb-progress-steps', ProgressSteps)
