import type { Decorator, Preview } from '@storybook/web-components-vite'
import { html } from 'lit'
import '../stories/setup.js'
import { registerCubeStoryEvents } from '../stories/events.js'

registerCubeStoryEvents()

const withCubeTheme: Decorator = (Story, context) => {
    const requestedAppearance = String(context.globals.appearance)
    const appearance = ['light', 'dark', 'system'].includes(requestedAppearance) ? requestedAppearance : 'light'
    return html`<cb-theme-provider appearance=${appearance}><cube-story-events data-story-id=${context.id}>${Story()}</cube-story-events></cb-theme-provider>`
}

const preview: Preview = {
    decorators: [withCubeTheme],
    parameters: {
        controls: { expanded: true },
        actions: { depth: 8, limit: 100, clearOnStoryChange: true },
        a11y: { test: 'error' },
        layout: 'padded',
        options: { storySort: { order: [
            'Action', 'Text', 'Form', 'Layout', 'Navigation', 'Overlay', 'Feedback', 'Data display', 'Media', 'Charts',
            'Styling', 'Editor', 'Collaboration', 'Icons', 'Theme', 'Examples',
        ] } },
    },
    globalTypes: { appearance: { description: 'Component appearance', toolbar: { icon: 'circlehollow', items: ['light','dark','system'] } } },
    initialGlobals: { appearance: 'light' },
}
export default preview
