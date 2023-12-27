import { Cube, ShadowRootModeEnum } from '../types'
import { config } from '../config'
import { Props } from '@beforesemicolon/web-component'

export interface IntlNameProps {
    value: string
    type:
        | 'language'
        | 'region'
        | 'script'
        | 'dateTimeField'
        | 'currency'
        | 'calendar'
    style: 'long' | 'short' | 'narrow' | undefined
    locale: string | undefined
}

export default ({ register, host, template, TC }: Cube) => {
    const intlName = (
        locale: string,
        value: IntlNameProps['value'],
        type: IntlNameProps['type'] = 'language',
        style: IntlNameProps['style'] = 'long'
    ) => {
        if (!TC.string(value) || TC.empty(value)) {
            console.error('intl-name: invalid value', value)
            return ''
        }

        return new Intl.DisplayNames(locale, {
            style: style,
            type: type,
        }).of(value)
    }

    const IntlName = (props: Props<IntlNameProps>) => {
        const comp = host()
        const locale = new Intl.Locale(
            document.documentElement.lang || config.lang
        )
        const content = comp.textContent

        comp.innerHTML = ''

        const name = () => {
            return intlName(
                props.locale() || locale.language,
                props.value() || content || '',
                props.type(),
                props.style()
            )
        }

        template`${name}`
    }

    register<IntlNameProps>(
        IntlName,
        {
            value: '',
            type: 'language',
            style: 'long',
            locale: undefined,
        },
        { mode: ShadowRootModeEnum.NONE }
    )

    return intlName
}
