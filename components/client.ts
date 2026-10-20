import './core/browser.js'
import { registerIcons } from './icons/register.js'
export * from './icons/register.js'
import { registerAction } from './action/register.js'
export * from './action/register.js'
import { registerNavigation } from './navigation/register.js'
export * from './navigation/register.js'
import { registerForm } from './form/register.js'
export * from './form/register.js'
import { registerLayout } from './layout/register.js'
export * from './layout/register.js'
import { registerFeedback } from './feedback/register.js'
export * from './feedback/register.js'
import { registerDataDisplay } from './data-display/register.js'
export * from './data-display/register.js'
import { registerOverlay } from './overlay/register.js'
export * from './overlay/register.js'
import { registerText } from './text/register.js'
export * from './text/register.js'
import { registerMedia } from './media/register.js'
export * from './media/register.js'
import { registerCharts } from './charts/register.js'
export * from './charts/register.js'
import { registerStyling } from './styling/register.js'
export * from './styling/register.js'
import { registerEditor } from './editor/register.js'
export * from './editor/register.js'
import { registerCollaboration } from './collaboration/register.js'
export * from './collaboration/register.js'
import { registerTheme } from './theme/register.js'
export * from './theme/register.js'

registerIcons()
registerAction()
registerNavigation()
registerForm()
registerLayout()
registerFeedback()
registerDataDisplay()
registerOverlay()
registerText()
registerMedia()
registerCharts()
registerStyling()
registerEditor()
registerCollaboration()
registerTheme()

export const ready = Promise.resolve()
