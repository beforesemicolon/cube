import {
    when,
    repeat,
    html,
    element,
    state,
    HtmlTemplate,
    effect,
    helper,
    Helper,
} from '@beforesemicolon/html'

import {
    register,
    onMount,
    onDestroy,
    onAdoption,
    template,
    eventDispatch,
    host,
    onUpdate,
    onDOMUpdate,
    onError,
    useContext,
    createContext,
    onContextUpdate,
} from './cube'
import { TC } from './utils'
import { config, updateConfig } from './config'

if (window) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.BFS = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...(window.BFS || {}),
        Cube: {
            TC,
            register,
            config,
            updateConfig,
            onMount,
            onDestroy,
            onAdoption,
            onUpdate,
            onDOMUpdate,
            onError,
            onContextUpdate,
            useContext,
            createContext,
            template,
            eventDispatch,
            host,
            // @bfs/html
            when,
            repeat,
            effect,
            html,
            element,
            state,
            helper,
            Helper,
            HtmlTemplate,
        },
    }
}
