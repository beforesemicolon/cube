export default {
    meta: { siteName: 'Cube', title: 'Cube by Before Semicolon', description: 'Accessible, headless and themed web components for visual editors.' },
    site: { name: 'Cube', packageName: '@beforesemicolon/cube', repositoryUrl: 'https://github.com/beforesemicolon/cube', repositoryLabel: 'Cube GitHub', docsEditUrl: 'https://github.com/beforesemicolon/cube/tree/main/docs-cube', footerDescription: 'Cube by Before Semicolon' },
    markedOptions: { extensions: [{
        name: 'cubeExample', level: 'block',
        start(source: string) { return source.indexOf(':::cube ') },
        tokenizer(source: string) {
            const match = /^:::cube (audio-player|video-player|cartesian-chart|pie-chart)\s*\n:::\s*(?:\n|$)/.exec(source)
            if (match) return { type: 'cubeExample', raw: match[0], component: match[1] }
        },
        renderer(token: { component: string }) { return `<div data-cube-example="${token.component}"></div>` },
    }] },
}
