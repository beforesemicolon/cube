import { readFileSync } from 'node:fs'
import type { RendererThis, Tokens } from 'marked'
import { componentDocsEntries } from '../../scripts/component-entries.js'

const { version }: { version: string } = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
)

function escapeAttribute(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

const description = 'A web component design system and library for building accessible, themeable interfaces.'

interface LandingToken {
    type: string
    layoutType?: string
    options?: Record<string, string>
    items?: { name: string | null; options: { componentCount?: boolean }; body: string }[]
}

export default {
    meta: { siteName: 'Cube', title: 'Cube by Before Semicolon', description },
    site: {
        name: 'Cube',
        packageName: '@beforesemicolon/cube',
        repositoryUrl: 'https://github.com/beforesemicolon/cube',
        repositoryLabel: 'Cube GitHub',
        docsEditUrl: 'https://github.com/beforesemicolon/cube/tree/main/docs-cube',
        footerDescription: description,
        navLinks: [
            { label: 'Features', i18n: 'common.navigation.features', href: '/#features' },
            { label: 'Code', i18n: 'common.navigation.code', href: '/#code' },
            { label: 'Install', i18n: 'common.navigation.install', href: '/#install' },
            { label: 'Playground', href: '/playground/' },
        ],
        footerGroups: [
            {
                title: 'Learning Resources',
                i18n: 'common.navigation.learningResources',
                links: [
                    {
                        label: 'Documentation',
                        i18n: 'common.navigation.documentation',
                        routeId: 'documentation/index',
                        href: '/documentation',
                    },
                    { label: 'Playground', href: '/playground/' },
                ],
            },
            {
                title: 'About Before Semicolon',
                i18n: 'common.navigation.aboutBeforeSemicolon',
                links: [
                    {
                        label: 'Open Source',
                        i18n: 'common.navigation.openSource',
                        href: 'https://github.com/beforesemicolon',
                    },
                    {
                        label: 'Website',
                        i18n: 'common.navigation.website',
                        href: 'https://beforesemicolon.com/',
                    },
                    {
                        label: 'Blog',
                        i18n: 'common.navigation.blog',
                        href: 'https://medium.com/before-semicolon',
                    },
                    {
                        label: 'YouTube Channel',
                        i18n: 'common.navigation.youtubeChannel',
                        href: 'https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw',
                    },
                ],
            },
        ],
        socialLinks: [
            {
                name: 'Medium blog',
                href: 'https://medium.com/before-semicolon',
                icon: '/assets/medium2.svg',
            },
            {
                name: 'Facebook',
                href: 'https://www.facebook.com/beforesemicolon/',
                icon: '/assets/facebook.svg',
            },
            {
                name: 'Instagram',
                href: 'https://www.instagram.com/before_semicolon_/',
                icon: '/assets/instagram.svg',
            },
            {
                name: 'Reddit',
                href: 'https://www.reddit.com/r/beforesemicolon/',
                icon: '/assets/reddit.svg',
            },
            {
                name: 'Twitter',
                href: 'https://twitter.com/BeforeSemicolon',
                icon: '/assets/twitter.svg',
            },
            {
                name: 'YouTube',
                href: 'https://www.youtube.com/channel/UCrU33aw1k9BqTIq2yKXrmBw',
                icon: '/assets/youtube.svg',
            },
        ],
        copyright: `Copyright &copy; ${new Date().getFullYear()} Before Semicolon. All rights reserved.`,
    },
    stylesheets: {
        document: [
            '/stylesheets/github-dark.hightlighter.css',
            '/stylesheets/documentation.css',
            '/stylesheets/cube-documentation.css',
        ],
    },
    theme: {
        light: {
            '--primary': 'oklch(0.51 0.21 295)',
            '--primary-glow': 'oklch(0.57 0.19 300)',
            '--accent': 'oklch(0.49 0.18 305)',
            '--ring': 'var(--primary)',
        },
        dark: {
            '--primary': 'oklch(0.76 0.16 295)',
            '--primary-glow': 'oklch(0.81 0.13 300)',
            '--accent': 'oklch(0.79 0.14 305)',
            '--ring': 'var(--primary)',
        },
    },
    markedOptions: {
        walkTokens(token: LandingToken): void {
            if (token.type === 'markdownLayout' && token.layoutType === 'landing-hero' && token.options) {
                token.options.version = `v${version}`
                const stat = token.items?.find(item => item.name === 'stat' && item.options.componentCount)
                if (stat) stat.body = `## ${componentDocsEntries.length}\n\n${stat.body}`
            }
        },
        extensions: [{
            name: 'cubeComponent',
            level: 'block',
            childTokens: ['tokens'],
            start(source: string): number | undefined {
                return source.match(/^:::component\s*$/m)?.index
            },
            tokenizer(source: string) {
                const match = /^:::component[ \t]*\n([\s\S]+?)\n:::[ \t]*(?:\n|$)/.exec(source)
                if (!match) return
                const html = match[1].trim()
                const code: Tokens.Code = {
                    type: 'code', lang: 'html', text: html,
                    raw: '```html\n' + html + '\n```',
                }
                return { type: 'cubeComponent', raw: match[0], html, tokens: [code] }
            },
            renderer(this: RendererThis, token: { html: string; tokens: Tokens.Code[] }): string {
                return `<div class="cube-component-demo" data-cube-preview="${escapeAttribute(token.html)}"></div>${this.parser.parse(token.tokens)}`
            },
        }],
    },
}
