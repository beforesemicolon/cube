import { initializeRuntime, type CubeRuntime } from './core/runtime.js'
import { initializeAction } from './action/index.js'
import { initializeText } from './text/index.js'
import { initializeForm } from './form/index.js'
import { initializeLayout } from './layout/index.js'
import { initializeNavigation } from './navigation/index.js'
import { initializeOverlay } from './overlay/index.js'
import { initializeFeedback } from './feedback/index.js'
import { initializeDataDisplay } from './data-display/index.js'
import { initializeMedia } from './media/index.js'
import { initializeCharts } from './charts/index.js'
import { initializeStyling } from './styling/index.js'
import { initializeEditor } from './editor/index.js'
import { initializeCollaboration } from './collaboration/index.js'
import { initializeIcons } from './icons/index.js'
import { initializeTheme } from './theme/index.js'

export const categories = {
    action: initializeAction, text: initializeText, form: initializeForm, layout: initializeLayout,
    navigation: initializeNavigation, overlay: initializeOverlay, feedback: initializeFeedback,
    'data-display': initializeDataDisplay, media: initializeMedia, charts: initializeCharts,
    styling: initializeStyling, editor: initializeEditor, collaboration: initializeCollaboration,
    icons: initializeIcons, theme: initializeTheme,
} as const
export type Category = keyof typeof categories
export type { CubeRuntime } from './core/runtime.js'

/** Initialize all categories with the application's existing rendering engine. */
export async function initializeCube(runtime: CubeRuntime): Promise<void> {
    initializeRuntime(runtime)
    const [icons, action, navigation, form, layout, feedback, display, overlay, text, media, charts, styling, editor, collaboration, theme, core] = await Promise.all([
        import('./icons/register.js'), import('./action/register.js'), import('./navigation/register.js'),
        import('./form/register.js'), import('./layout/register.js'), import('./feedback/register.js'),
        import('./data-display/register.js'), import('./overlay/register.js'), import('./text/register.js'),
        import('./media/register.js'), import('./charts/register.js'), import('./styling/register.js'),
        import('./editor/register.js'), import('./collaboration/register.js'), import('./theme/register.js'),
        import('./core/Component.js'),
    ])
    // Define shared leaves first so upgrading existing application markup can compose them immediately.
    core.register('cb-button', action.Button)
    core.register('cb-link', navigation.Link)
    core.register('cb-menu', navigation.Menu)
    core.register('cb-panel-header', layout.PanelHeader)
    icons.registerIcons()
    action.registerAction()
    navigation.registerNavigation()
    form.registerForm()
    layout.registerLayout()
    feedback.registerFeedback()
    display.registerDataDisplay()
    overlay.registerOverlay()
    text.registerText()
    media.registerMedia()
    charts.registerCharts()
    styling.registerStyling()
    editor.registerEditor()
    collaboration.registerCollaboration()
    theme.registerTheme()
}

export default initializeCube
