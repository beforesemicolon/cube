import type { StorybookConfig } from '@storybook/web-components-vite'
import { mergeConfig } from 'vite'
const config: StorybookConfig = {
    framework: '@storybook/web-components-vite', stories: ['../stories/**/*.stories.ts'],
    addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
    features: { actions: true },
    staticDirs: ['../design'],
    // Controls group inherited props by their declaring class, including in production.
    viteFinal: config => mergeConfig(config, { build: { rolldownOptions: { output: { keepNames: true } } } }),
}
export default config
