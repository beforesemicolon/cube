import {
    when,
    repeat,
    is,
    isNot,
    or,
    and,
    suspense,
    pick,
    oneOf,
    html,
    element,
    state,
    val,
    HtmlTemplate,
    effect,
    helper,
    Helper,
} from '@beforesemicolon/web-component'

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
            repeat,
            when,
            is,
            isNot,
            and,
            or,
            pick,
            effect,
            oneOf,
            suspense,
            element,
            val,
            html,
            state,
            helper,
            Helper,
            HtmlTemplate,
        },
    }
}
