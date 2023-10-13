/* eslint-disable  @typescript-eslint/no-explicit-any */
import {
    HtmlTemplate,
    repeat,
    html,
    when,
    element,
    effect,
    state,
} from '@beforesemicolon/html'
import {
    eventDispatch,
    host,
    onAdoption,
    onDestroy,
    onMount,
    register,
    template,
    createContext,
    useContext,
} from './cube'
import { TC } from './utils/type-check'
import { config } from './config'

export interface StylesheetObject {
    [k: string]: Partial<CSSStyleDeclaration> | StylesheetObject | number
}

export type Stylesheet = StylesheetObject | string
export type Style<P> = (data: Props<P>) => Stylesheet
export type Props<P> = {
    [K in keyof P]: () => P[K]
}
export type FnComponent<P> = (props: Props<P>) => void
export enum ShadowRootMode {
    OPEN = 'open',
    CLOSED = 'closed',
    NONE = 'none',
}

export interface ComponentOptions {
    mode?: ShadowRootMode
    delegatesFocus?: boolean
}

export interface Config extends ComponentOptions {
    lang: string
    onError: (e: Error) => void
}

export type ObjectLiteral = Record<string | number | symbol, any>
export interface CurrentComponent {
    destroy: (() => void) | null
    mount: (() => void | (() => void)) | null
    adoption: (() => void) | null
    error: ((err: Error) => void) | null
    domUpdate: ((nodes: Set<Node>) => void) | null
    update:
        | ((propName: string, newValue: unknown, oldValue: unknown) => void)
        | null
    contextUpdate: (
        propName: string,
        newValue: unknown,
        oldValue: unknown
    ) => void
    dispatchEvent: (e: CustomEvent) => void
    contextMap: Map<
        string,
        {
            reactive: boolean
            inContext: boolean
            ctx: ContextModel<unknown> | null
        }
    >
    template: HtmlTemplate | null
    self: HTMLElement
}

export interface ContextModel<T> {
    readonly: boolean
    getData: () => T
    setData: (data: T) => void
    subs: Set<(name: string, newValue: unknown, oldValue: unknown) => void>
}

export type Context<T> = Record<string, ContextModel<T>>

export type WebComponent<P extends ObjectLiteral> = HTMLElement & {
    [key in keyof P]: P[string]
}

export interface Cube {
    register: typeof register
    onMount: typeof onMount
    onDestroy: typeof onDestroy
    onAdoption: typeof onAdoption
    eventDispatch: typeof eventDispatch
    template: typeof template
    host: typeof host
    repeat: typeof repeat
    when: typeof when
    state: typeof state
    effect: typeof effect
    html: typeof html
    element: typeof element
    createContext: typeof createContext
    useContext: typeof useContext
    HtmlTemplate: HtmlTemplate
    TC: typeof TC
    config: typeof config
}

export type Subscriber<T> = (data: T | null) => void

export interface Store<T> {
    value: T | null
    update: (newData: T | null) => void
    subscribe: (sub: Subscriber<T>) => () => void
}

export type ListStoreItemID = unknown

export interface ListStore<T> {
    createItem: (item: T) => ListStoreItemID
    updateItem: (id: ListStoreItemID, item: Partial<T>) => T
    loadItems: (items: T[]) => ListStoreItemID[]
    getItem: (id: ListStoreItemID) => T | null
    getItems: () => T[]
    deleteItem: (id: ListStoreItemID) => ListStoreItemID
    deleteItems: (ids: ListStoreItemID[]) => ListStoreItemID[]
    findItem: (filter: (item: T) => boolean) => T | null
    findItems: (filter: (item: T) => boolean) => T[]
    subscribe: (sub: Subscriber<T[]>) => () => void
}
