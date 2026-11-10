import type { StorybookConfig } from '@storybook/web-components-vite'
import { mergeConfig } from 'vite'
import siteConfig from '../docs-cube/site.config.json' with { type: 'json' }

const analytics = siteConfig.document.analytics.providers.find(provider => provider.type === 'google-analytics' && provider.enabled)
const config: StorybookConfig = {
    framework: '@storybook/web-components-vite', stories: ['../stories/**/*.stories.ts'],
    addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
    features: { actions: true },
    staticDirs: ['../design', { from: '../docs-cube/_template/assets', to: '/cube-brand' }],
    managerHead: (head: string | undefined): string | undefined => analytics ? `${head ?? ''}
        <script>
            if (location.origin === ${JSON.stringify(siteConfig.siteUrl)}) {
                window.dataLayer = window.dataLayer || [];
                function gtag() { window.dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(analytics.tagId)}, ${JSON.stringify(analytics.config)});
                const tag = document.createElement('script');
                tag.async = true;
                tag.src = ${JSON.stringify(`https://www.googletagmanager.com/gtag/js?id=${analytics.tagId}`)};
                document.head.append(tag);
            }
        </script>` : head,
    // Controls group inherited props by their declaring class, including in production.
    viteFinal: config => mergeConfig(config, { build: { rolldownOptions: { output: { keepNames: true } } } }),
}
export default config
