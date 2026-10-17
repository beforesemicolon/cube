import type { Preview } from '@storybook/web-components-vite'
const preview: Preview = {
    parameters: { controls: { expanded: true }, a11y: { test: 'error' }, layout: 'padded' },
    globalTypes: { appearance: { description: 'Editor appearance', toolbar: { icon: 'circlehollow', items: ['light','dark','system'] } } },
    initialGlobals: { appearance: 'light' },
}
export default preview
