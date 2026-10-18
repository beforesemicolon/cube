import type { Decorator, Preview } from '@storybook/web-components-vite'
import { html } from 'lit'
import '../components/theme/theme-provider/index.js'

const withCubeTheme: Decorator = (Story, context) => {
    const requestedAppearance = String(context.globals.appearance)
    const appearance = ['light', 'dark', 'system'].includes(requestedAppearance) ? requestedAppearance : 'light'
    return html`<cb-theme-provider appearance=${appearance}>${Story()}</cb-theme-provider>`
}

const preview: Preview = {
    decorators: [withCubeTheme],
    parameters: {
        controls: { expanded: true },
        a11y: { test: 'error' },
        layout: 'padded',
        options: { storySort: { order: [
            'Action', 'Form', 'Layout', 'Navigation', 'Overlay', 'Feedback', 'Data display', 'Media', 'Charts',
            'Styling', 'Editor', 'Collaboration', 'Icons', 'Theme', 'Design references', 'Examples',
        ] } },
    },
    globalTypes: { appearance: { description: 'Component appearance', toolbar: { icon: 'circlehollow', items: ['light','dark','system'] } } },
    initialGlobals: { appearance: 'light' },
}
export default preview
