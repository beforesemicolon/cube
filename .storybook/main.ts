import type { StorybookConfig } from '@storybook/web-components-vite'
const config: StorybookConfig = {
    framework: '@storybook/web-components-vite', stories: ['../stories/**/*.stories.ts'],
    addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
    staticDirs: ['../design'],
}
export default config
