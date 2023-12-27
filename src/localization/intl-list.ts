import { Cube, ShadowRootModeEnum } from '../types'
import { config } from '../config'
import { Props, ObjectLiteral } from '@beforesemicolon/web-component'

export interface IntlListProps {
    items: Array<string> | undefined
    type: 'and' | 'or' | 'none' | 'disjunction' | 'conjunction' | 'unit'
    style: 'short' | 'narrow' | 'long' | undefined
    locale: string | undefined
}

export default ({ register, template }: Cube) => {
    const Type: ObjectLiteral = {
        or: 'disjunction',
        and: 'conjunction',
        none: 'unit',
    }

    const intlList = (
        locale: IntlListProps['locale'],
        items: IntlListProps['items'] = [],
        type: IntlListProps['type'] = 'and',
        style: IntlListProps['style'] = 'long'
    ) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new Intl.ListFormat(locale || locale.language, {
            style,
            type: (Type[type] ?? type) || 'and',
        }).format(items || [])
    }

    const IntlList = (props: Props<IntlListProps>) => {
        const locale = new Intl.Locale(
            document.documentElement.lang || config.lang
        )

        const list = () => {
            return intlList(
                props.locale() || locale.language,
                props.items(),
                props.type(),
                props.style()
            )
        }

        template`${list}`
    }

    register<IntlListProps>(
        IntlList,
        {
            items: undefined,
            type: 'and',
            style: 'long',
            locale: undefined,
        },
        { mode: ShadowRootModeEnum.NONE }
    )

    return intlList
}
