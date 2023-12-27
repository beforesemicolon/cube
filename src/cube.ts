import {
    HtmlTemplate,
    state,
    booleanAttributes,
    jsonParse,
    turnCamelToKebabCasing,
    turnKebabToCamelCasing,
    WebComponent,
    Props,
    ObjectInterface,
    ObjectLiteral,
} from '@beforesemicolon/web-component'

import { getStyleString, JSONToCSS, TC } from './utils'
import {
    ComponentOptions,
    CurrentComponent,
    FnComponent,
    ShadowRootModeEnum,
    Style,
    Stylesheet,
} from './types'
import { config } from './config'
import initContext from './context'

let currentComponent: CurrentComponent<ObjectLiteral> | null = null
const CTX = initContext(() => currentComponent)

export const { useContext, createContext, onContextUpdate } = CTX

export function register<P extends ObjectInterface<P>>(
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
        throw new Error('HTMLComponentElement render function must have a name')
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
    cb: (propName: unknown, newValue: unknown, oldValue: unknown) => void
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

function createComponentClass<P extends ObjectInterface<P>>(
    tagName: string,
    {
        delegatesFocus = false,
        mode = ShadowRootModeEnum.OPEN,
        props,
        comp,
        stylesheet,
    }: {
        mode?: ShadowRootModeEnum
        delegatesFocus?: boolean
        props: P
        comp: FnComponent<P>
        stylesheet?: Style<P>
    }
) {
    const CLS = customElements.get(tagName)

    if (!CLS) {
        const propsClone = structuredClone(props)
        const propKeys = Object.keys(propsClone)

        return customElements.define(
            tagName,
            class extends WebComponent<P> {
                static readonly tagName = tagName
                static readonly observedAttributes: Array<string> = Object.keys(
                    props
                ).map((s) => s.toLowerCase())
                delegatesFocus = delegatesFocus
                mode = mode as ShadowRootMode
                shadow = mode !== ShadowRootModeEnum.NONE
                tagName = tagName
                stylesheet = this.getStyle()
                #renderedBefore = false
                #observer: MutationObserver | null = null
                #handlers: CurrentComponent<P> = {
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

                constructor() {
                    super()

                    // initialize prop values
                    propKeys.forEach((key) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        this[key] = propsClone[key]
                    })
                }

                getStyle() {
                    let style: Stylesheet = ''

                    if (TC.function(stylesheet)) {
                        style = stylesheet(this.props)

                        if (style) {
                            style = TC.objectLiteral(style)
                                ? JSONToCSS(style, tagName, this.shadow)
                                : TC.string(style)
                                ? getStyleString(
                                      style,
                                      tagName.toLowerCase(),
                                      this.shadow
                                  )
                                : ''
                        }
                    }

                    return style
                }

                connectedCallback() {
                    currentComponent = this.#handlers
                    comp(this.props)
                    currentComponent = null
                    super.connectedCallback()
                }

                onMount() {
                    if (this.#renderedBefore) {
                        // verify that the component was mounted in context and
                        // onPageChange it to all context it needs
                        this.#handlers.contextMap.forEach((val, name) => {
                            try {
                                const ctx =
                                    CTX.getContextHost(name, this) ?? null
                                val.inContext = true
                                val.ctx = ctx
                                val.ctx?.subs.add(this.#handlers.contextUpdate)
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
                            this.shadowRoot ?? this,
                            observerOptions
                        )
                    }

                    const destroy = this.#handlers.mount?.() || null

                    if (!this.#handlers.destroy && TC.function(destroy)) {
                        this.#handlers.destroy = destroy
                    }

                    this.#renderedBefore = true
                }

                onDestroy() {
                    this.#handlers.contextMap.forEach((val) => {
                        val.ctx?.subs.delete(this.#handlers.contextUpdate)
                    })
                    this.#observer?.disconnect()
                    this.#handlers.destroy?.()
                }

                onUpdate(key: keyof P, newValue: unknown, oldValue: unknown) {
                    this.#handlers.update?.(key, newValue, oldValue)
                    if (TC.function(stylesheet) && stylesheet.length > 0) {
                        this.updateStylesheet(this.getStyle())
                    }
                }

                onAdoption() {
                    this.#handlers.adoption?.()
                }

                onError(error: Error) {
                    this.#handlers.error?.(error)
                }

                render() {
                    return this.#handlers.template ?? ''
                }
            }
        )
    }
}
