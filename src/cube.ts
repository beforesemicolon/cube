import { HtmlTemplate, state } from '@beforesemicolon/html'
import {
    booleanAttributes,
    jsonParse,
    turnCamelToKebabCasing,
    turnKebabToCamelCasing,
} from '@beforesemicolon/html/dist/utils'
import { getStyleString, JSONToCSS, TC } from './utils'
import {
    ComponentOptions,
    CurrentComponent,
    FnComponent,
    ObjectLiteral,
    Props,
    ShadowRootMode,
    Style,
    Stylesheet,
} from './types'
import { config } from './config'
import initContext from './context'

let currentComponent: CurrentComponent | null = null
const CTX = initContext(() => currentComponent)

export const { useContext, createContext, onContextUpdate } = CTX

export function register<P extends ObjectLiteral>(
    comp: FnComponent<P>,
    props: P = {} as P,
    styleOrOptions: Style<P> | ComponentOptions = config,
    opt: ComponentOptions = config
) {
    if (!TC.objectLiteral(props)) {
        props = {} as P
    }

    const isStyle = TC.function(styleOrOptions)
    const stylesheet = (isStyle ? styleOrOptions : undefined) as Style<P>
    const { mode = config.mode, delegatesFocus = config.delegatesFocus } = (
        isStyle ? opt : styleOrOptions
    ) as ComponentOptions

    const tagName = turnCamelToKebabCasing(comp.name || '')

    if (!tagName) {
        throw new Error('Component render function must have a name')
    }

    createComponentClass<P>(tagName, {
        mode,
        delegatesFocus,
        comp,
        props,
        stylesheet,
    })

    return {
        tagName,
        props,
        mode,
        delegatesFocus,
    }
}

export const onMount = (cb: () => void) => {
    if (currentComponent) {
        if (currentComponent.mount === null) {
            currentComponent.mount = cb
        }
    } else {
        throw new Error(
            'Must NOT use "onMount" lifecycle outside of a component'
        )
    }
}

export const onUpdate = (
    cb: (propName: string, newValue: unknown, oldValue: unknown) => void
) => {
    if (currentComponent) {
        if (currentComponent.update === null) {
            currentComponent.update = cb
        }
    } else {
        throw new Error(
            'Must NOT use "onUpdate" lifecycle outside of a component'
        )
    }
}

export const onDOMUpdate = (cb: (nodes: Set<Node>) => void) => {
    if (currentComponent) {
        if (currentComponent.domUpdate === null) {
            currentComponent.domUpdate = cb
        }
    } else {
        throw new Error(
            'Must NOT use "onDOMUpdate" lifecycle outside of a component'
        )
    }
}

export const onDestroy = (cb: () => void) => {
    if (currentComponent) {
        currentComponent.destroy = cb
    } else {
        throw new Error(
            'Must NOT use "onDestroy" lifecycle outside of a component'
        )
    }
}

export const onAdoption = (cb: () => void) => {
    if (currentComponent) {
        if (currentComponent.adoption === null) {
            currentComponent.adoption = cb
        }
    } else {
        throw new Error(
            'Must NOT use "onAdoption" lifecycle outside of a component'
        )
    }
}

/**
 * sets a listener for unknown error that happens after its setting
 * @param cb
 */
export const onError = (cb: (err: Error) => void) => {
    if (currentComponent) {
        currentComponent.error = cb
    } else {
        throw new Error(
            'Must NOT use "onError" lifecycle outside of a component'
        )
    }
}

export const eventDispatch = () => {
    const comp = currentComponent

    if (comp) {
        return <T>(eventName: string, detail?: T) => {
            comp.dispatchEvent(
                new CustomEvent(eventName, {
                    detail,
                })
            )
        }
    }

    throw new Error('Must NOT use "eventDispatch" outside of a component')
}

export const template = (parts: TemplateStringsArray, ...values: unknown[]) => {
    const comp = currentComponent
    if (comp) {
        comp.template = new HtmlTemplate(parts, values)

        return comp.template
    }

    throw new Error('Must NOT use "template" outside of a component')
}

export const host = () => {
    if (currentComponent) {
        return currentComponent.self
    }

    throw new Error('Must NOT use "host" outside of a component')
}

export const refs = () => {
    if (currentComponent) {
        const comp = currentComponent
        return (name: string) => comp.template?.refs[name] ?? []
    }

    throw new Error('Must NOT use "refs" outside of a component')
}

function createComponentClass<P extends ObjectLiteral>(
    tagName: string,
    {
        delegatesFocus = false,
        mode = ShadowRootMode.OPEN,
        props,
        comp,
        stylesheet,
    }: {
        mode?: ShadowRootMode
        delegatesFocus?: boolean
        props: P
        comp: FnComponent<P>
        stylesheet?: Style<P>
    }
) {
    const CLS = customElements.get(tagName)

    const styleClsName = `CUBE-${tagName}`

    if (!CLS) {
        class WebComponent extends HTMLElement {
            static observedAttributes: Array<string> = Object.keys(props).map(
                turnCamelToKebabCasing
            )
            static readonly tagName = tagName
            tagName = tagName
            #renderedBefore = false
            #shadowRoot: ShadowRoot | HTMLElement
            #handlers: CurrentComponent = {
                destroy: null,
                mount: null,
                update: null,
                domUpdate: null,
                adoption: null,
                error: config.onError,
                dispatchEvent: (e: CustomEvent) => {
                    this.dispatchEvent(e)
                },
                contextMap: new Map(),
                contextUpdate: () => {
                    this.#handlers.template?.update()
                },
                template: null,
                self: this,
            }
            #styleElement?: HTMLStyleElement
            #props: P = structuredClone(props)
            #propKeys = Object.keys(this.#props)
            #propsState = this.#propKeys.reduce(
                (acc, key: keyof P) => {
                    const [get, set] = state<unknown>(this.#props[key])
                    acc[key] = { get, set }
                    return acc
                },
                {} as Record<
                    keyof P,
                    {
                        get: ReturnType<typeof state>[0]
                        set: ReturnType<typeof state>[1]
                    }
                >
            )

            #readonlyProps = this.#propKeys.reduce(
                (acc, key: keyof P) => {
                    acc[key] = this.#propsState[key].get
                    return acc
                },
                {} as Record<keyof P, ReturnType<typeof state>[0]>
            ) as Props<P>
            #observer: MutationObserver | null = null
            __ROOT__: ShadowRoot | undefined

            getStyle() {
                let style: Stylesheet = ''

                if (TC.function(stylesheet)) {
                    style = stylesheet(this.#readonlyProps)

                    if (style) {
                        style = TC.objectLiteral(style)
                            ? `<style class="${styleClsName}">${JSONToCSS(
                                  style,
                                  tagName,
                                  mode !== ShadowRootMode.NONE
                              )}</style>`
                            : TC.string(style)
                            ? getStyleString(
                                  style,
                                  tagName.toLowerCase(),
                                  mode !== ShadowRootMode.NONE
                              )
                            : ''
                    }
                }

                return style
            }

            updateStyle() {
                const style = this.getStyle()
                if (this.#styleElement) {
                    const div = document.createElement('div')
                    div.innerHTML = style
                    this.#styleElement.innerHTML =
                        div.querySelector('style')?.innerHTML ?? ''
                }
            }

            constructor() {
                super()

                this.#propKeys.forEach((key) => {
                    Object.defineProperty(this, key, {
                        get() {
                            return this.#propsState[key].get()
                        },
                        set(newValue: unknown) {
                            // ignore attribute value that hasn't been parsed to their real value yet
                            // this can happen after string parsed to node and before executables are collected
                            if (!/{{val[\d+]}}/.test(String(newValue))) {
                                const oldValue = this.#propsState[key].get()

                                if (newValue !== oldValue) {
                                    this.#propsState[key].set(newValue)

                                    // only perform DOM updates while mounted
                                    if (
                                        this.isConnected &&
                                        this.#renderedBefore
                                    ) {
                                        try {
                                            this.#handlers.update?.(
                                                key,
                                                newValue,
                                                oldValue
                                            )
                                            // only update style if it is a callback expecting arguments
                                            // otherwise it is an indication that the style does not use the props values
                                            if (
                                                TC.function(stylesheet) &&
                                                stylesheet.length > 0
                                            ) {
                                                this.updateStyle()
                                            }
                                        } catch (e) {
                                            this.#handlers.error?.(e as Error)
                                        }
                                    }
                                }
                            }
                        },
                    })
                })

                if (mode === ShadowRootMode.NONE) {
                    this.#shadowRoot = this
                } else {
                    this.#shadowRoot = this.attachShadow({
                        mode,
                        delegatesFocus,
                    })
                    this.__ROOT__ = this.#shadowRoot
                }
            }

            async connectedCallback() {
                requestAnimationFrame(() => {
                    try {
                        if (!this.#renderedBefore) {
                            currentComponent = this.#handlers
                            comp(this.#readonlyProps)
                            currentComponent = null

                            const style = this.getStyle()

                            if (style) {
                                if (mode === ShadowRootMode.NONE) {
                                    const styleEl = document.head.querySelector(
                                        `[class*="${styleClsName}"]`
                                    ) as HTMLStyleElement

                                    if (!styleEl) {
                                        document.head.insertAdjacentHTML(
                                            'beforeend',
                                            style
                                        )
                                    }

                                    this.#styleElement = styleEl
                                } else {
                                    this.#shadowRoot.innerHTML = style
                                    this.#styleElement =
                                        this.#shadowRoot.querySelector(
                                            `[class*="${styleClsName}"]`
                                        ) as HTMLStyleElement
                                }
                            }

                            this.#handlers.template?.render(this.#shadowRoot)
                        } else {
                            // verify that the component was mounted in context and
                            // onPageChange it to all context it needs
                            this.#handlers.contextMap.forEach((val, name) => {
                                try {
                                    const ctx =
                                        CTX.getContextHost(name, this) ?? null
                                    val.inContext = true
                                    val.ctx = ctx
                                    val.ctx?.subs.add(
                                        this.#handlers.contextUpdate
                                    )
                                } catch (e) {
                                    console.error(
                                        `Component "${tagName}" is no longer in context of "${name}"`
                                    )
                                    // set inContext to false in case there is something trying to
                                    // read or update the context. only components in context can do that
                                    val.inContext = false
                                    this.#handlers.error?.(e as Error)
                                }
                            })
                            this.#handlers.template?.update()
                        }

                        if (TC.function(this.#handlers.domUpdate)) {
                            const observerOptions = {
                                childList: true,
                                subtree: true,
                                attributes: true,
                            }

                            this.#observer = new MutationObserver((records) => {
                                if (this.isConnected) {
                                    try {
                                        this.#handlers.domUpdate?.(
                                            new Set(
                                                records.map((rec) => rec.target)
                                            )
                                        )
                                    } catch (e) {
                                        this.#handlers.error?.(e as Error)
                                    }
                                }
                            })

                            this.#observer.observe(
                                this.#shadowRoot,
                                observerOptions
                            )
                        }

                        const destroy = this.#handlers.mount?.() || null

                        if (!this.#handlers.destroy && TC.function(destroy)) {
                            this.#handlers.destroy = destroy
                        }

                        this.#renderedBefore = true
                    } catch (e) {
                        this.#handlers.error?.(e as Error)
                    }
                })
            }

            async disconnectedCallback() {
                requestAnimationFrame(() => {
                    try {
                        // unsubscribe from unknown existing context
                        this.#handlers.contextMap.forEach((val) => {
                            val.ctx?.subs.delete(this.#handlers.contextUpdate)
                        })
                        this.#handlers.destroy?.()
                        this.#observer?.disconnect()
                    } catch (e) {
                        this.#handlers.error?.(e as Error)
                    }
                })
            }

            async attributeChangedCallback(
                name: string,
                oldValue: unknown,
                newValue: unknown
            ) {
                // ignore attribute value that hasn't been parsed to their real value yet
                // this can happen after string parsed to node and before executables are collected
                if (!/{{val[\d+]}}/.test(String(newValue))) {
                    const propName = turnKebabToCamelCasing(name)

                    if (
                        !newValue &&
                        TC.boolean(this.#props[propName]) &&
                        name in booleanAttributes
                    ) {
                        newValue = this.hasAttribute(name)
                    }

                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this[propName] = jsonParse(newValue)
                }
            }

            async adoptedCallback() {
                requestAnimationFrame(() => {
                    try {
                        this.#handlers.adoption?.()
                    } catch (e) {
                        this.#handlers.error?.(e as Error)
                    }
                })
            }
        }

        return customElements.define(tagName, WebComponent)
    }
}
