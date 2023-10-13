import { Cube, ObjectLiteral, Props } from '../types'
import { config } from '../config'

interface IntlMsgProps {
    id: string
    values: ObjectLiteral
}

export default ({
    register,
    html,
    template,
    element,
    useContext,
    host,
    TC,
}: Cube) => {
    const IntlMsg = (props: Props<IntlMsgProps>) => {
        const comp = host()
        const locale = new Intl.Locale(
            document.documentElement.lang || config.lang
        )
        const msgs = useContext<ObjectLiteral>('intl-msg')

        const msg = () => {
            if (msgs.value() === null) {
                return ''
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const dir = locale.textInfo.direction
            const map = msgs.value() ?? {}
            const txtParts: Array<string> = []
            const txtValues: Array<Element> = []
            const text = map[props.id()]

            if (text === undefined) {
                console.error(
                    `[intl-msg] id of "${props.id()}" was not found. Rendering the id itself as backup.`
                )
                return props.id()
            }

            const values = props.values()

            const pattern = /\{\s*([a-z0-9]+)\s*\}/g
            let txt = String(text)
            let match = null

            while ((match = pattern.exec(String(txt))) !== null) {
                const [, key] = match
                const before = txt.substring(0, match.index)

                before && txtParts.push(before)
                txtValues.push(
                    element('slot', {
                        attributes: {
                            name: key,
                        },
                        textContent: values[key],
                    })
                )
                txt = txt.substring(pattern.lastIndex)
            }

            txtParts.push(txt)

            const markup = html(
                txtParts as unknown as TemplateStringsArray,
                txtValues
            )

            comp.setAttribute('dir', dir)
            return markup
        }

        template`${msg}`
    }

    register<IntlMsgProps>(IntlMsg, {
        id: '',
        values: {},
    })

    return (msgs: ObjectLiteral, id: string, values: ObjectLiteral = {}) => {
        const msg = msgs[id]

        if (msg) {
            return TC.empty(values)
                ? msg
                : msg.replace(
                      /\{\s*([a-z0-9]+)\s*\}/g,
                      (_: string, key: string) => {
                          return values[key]
                      }
                  )
        }

        return id
    }
}
