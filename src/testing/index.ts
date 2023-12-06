import { element, HtmlTemplate } from '@beforesemicolon/markup'
import { register } from '../cube'
import {
    ComponentOptions,
    FnComponent,
    ObjectLiteral,
    ShadowRootMode,
    Style,
    WebComponent,
} from '../types'
import { TC } from '../utils'

const defaultOptions: ComponentOptions = {
    mode: ShadowRootMode.OPEN,
    delegatesFocus: false,
}

class ComponentControl<P extends ObjectLiteral> {
    constructor(public target: WebComponent<P>) {}

    /**
     * returns the target element's outerHTML or node content
     */
    toString() {
        return this.target.outerHTML
    }

    /**
     * returns the target element's innerHTML or node content
     * and can dig inside the component with shadow root
     */
    get content() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return (this.target.__ROOT__ ?? this.target).innerHTML
    }

    /**
     * finds elements inside the target element (only if it's an HTMLElement)
     * @param cssSelector
     */
    find(cssSelector: string): ComponentControl<P>[] {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return Array.from(
            (
                (this.target.__ROOT__ ?? this.target) as HTMLElement
            ).querySelectorAll(cssSelector),
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            (el) => new ComponentControl(el as HTMLElement)
        )
    }

    /**
     * sets event listener on the target element (only if it's an HTMLElement)
     * @param eventName
     * @param callback
     */
    on(eventName: string, callback: (event: Event) => void) {
        this.target.addEventListener(eventName, callback)
    }

    /**
     * removes the target element from the DOM (only if it's an HTMLElement)
     */
    unmount() {
        if (TC.type(this.target, HTMLElement)) {
            this.target.remove()
        }
    }
}

export const render = async <P extends ObjectLiteral>(
    el: Element | HTMLElement | Node | HtmlTemplate | string | FnComponent<P>,
    props: P = {} as P,
    styleOrOptions: Style<P> | ComponentOptions = {},
    opt: ComponentOptions = defaultOptions
): Promise<ComponentControl<P>> => {
    document.body.innerHTML = ''
    let target: HTMLElement = document.body

    if (TC.function(el)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { tagName } = register<P>(el, props, styleOrOptions, opt)

        target = element(tagName) as HTMLElement
        document.body.appendChild(target)
    } else if (TC.type(el, HtmlTemplate)) {
        ;(el as HtmlTemplate).render(document.body)
    } else if (TC.string(el)) {
        document.body.innerHTML = el
    } else if (TC.type(el, Node)) {
        document.body.appendChild(el)
        if (TC.type(el, HTMLElement)) {
            target = el
        }
    }

    await new Promise(process.nextTick)

    return new ComponentControl(target as WebComponent<P>)
}

export const waitFor = async <T>(
    cb: () => Promise<T> | T,
    timeout = 0
): Promise<T> => {
    return new Promise((res) =>
        setTimeout(async () => {
            const result = await cb()
            await new Promise(process.nextTick)
            res(result)
        }, timeout)
    )
}

export const wait = async (ms = 0) => {
    await waitFor(
        () =>
            new Promise((res) => {
                setTimeout(res, ms)
            })
    )
}
