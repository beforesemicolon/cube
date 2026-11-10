import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

const dark = window.matchMedia('(prefers-color-scheme: dark)').matches

addons.setConfig({
    theme: create({
        base: dark ? 'dark' : 'light',
        brandTitle: 'Cube Playground',
        brandUrl: '../',
        brandImage: dark ? './cube-brand/logo.dark.svg' : './cube-brand/logo.light.svg',
        brandTarget: '_self',
        colorSecondary: dark ? '#bb9aff' : '#7139cf',
    }),
})

// The manager sets its own browser title when navigating between stories.
const title = document.querySelector('title')
if (title) {
    const updateTitle = (): void => {
        const name = document.title.replace(/(?:^storybook - )?Storybook$/i, 'Cube Playground')
        if (name !== document.title) document.title = name
    }
    new MutationObserver(updateTitle).observe(title, { childList: true, characterData: true, subtree: true })
    updateTitle()
}
