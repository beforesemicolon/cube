import { register } from '../../core/Component.js'
import { createStudioView, type StudioView } from '../../studio/view.js'
import { ThemeSwitchBase } from './ThemeSwitchBase.js'

export class ThemeSwitch extends ThemeSwitchBase {
    private view?: StudioView
    render(): Node { this.view = createStudioView(this); return this.view.root }
    protected syncView(): void { this.view?.update() }
}

register('cb-theme-switch', ThemeSwitch)
export { ThemeSwitchBase }
export type { ThemeSwitchProps } from './ThemeSwitchBase.js'
