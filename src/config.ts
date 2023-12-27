import { Config, ShadowRootModeEnum } from './types'
import { TC } from './utils'

const defaultOptions: Config = {
    mode: ShadowRootModeEnum.OPEN,
    delegatesFocus: false,
    lang: 'en',
    onError: console.error,
}

export function updateConfig(opt: Partial<Config> = defaultOptions) {
    for (const optKey in opt) {
        switch (optKey) {
            case 'mode':
                defaultOptions.mode =
                    opt.mode &&
                    [
                        ShadowRootModeEnum.OPEN,
                        ShadowRootModeEnum.CLOSED,
                        ShadowRootModeEnum.NONE,
                    ].includes(opt.mode)
                        ? opt.mode
                        : ShadowRootModeEnum.OPEN
                break
            case 'delegatesFocus':
                defaultOptions.delegatesFocus = TC.boolean(opt.delegatesFocus)
                    ? opt.delegatesFocus
                    : false
                break
            case 'lang':
                defaultOptions.lang = String(opt.lang)
                break
            case 'onError':
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                defaultOptions.onError = TC.function(opt.onError)
                    ? opt.onError
                    : console.error
                break
        }
    }
}

export const config = {
    get mode() {
        return defaultOptions.mode
    },
    get delegatesFocus() {
        return defaultOptions.delegatesFocus
    },
    get lang() {
        return defaultOptions.lang
    },
    get onError() {
        return defaultOptions.onError
    },
}
