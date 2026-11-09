import { defineConfig } from 'vite'

export default defineConfig({
    optimizeDeps: {
        // Browser contract tests import the public entry through a variable.
        // Discover its dependencies up front, rather than reloading the page
        // (and discarding consumer markup) when that import is first exercised.
        entries: ['tests/browser/*.html', 'components/index.ts', 'stories/controls.ts'],
    },
})
