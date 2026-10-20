import { register } from '../core/Component.js'
import { ThemeProvider } from './theme-provider/index.js'
export * from './tokens.js'
export * from './theme-provider/index.js'

export function registerTheme(): void {
    register('cb-theme-provider', ThemeProvider)
}
