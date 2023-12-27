import { Cube } from '../../types'
import { isOnPage } from '../utils/is-on-page'
import { onPageChange, goToPage } from '../pages'
import { Props, ObjectLiteral } from '@beforesemicolon/web-component'

interface PageLinkProps extends ObjectLiteral {
    path: string
    title: string
    state: ObjectLiteral
}

export default ({
    eventDispatch,
    onMount,
    register,
    template,
    state,
}: Cube) => {
    const PageLink = (props: Props<PageLinkProps>) => {
        const dispatch = eventDispatch()
        const [part, setPart] = state('anchor')

        onMount(() => {
            const onRouteChange = () => {
                const newActive = isOnPage(props.path())
                setPart(newActive ? 'anchor active' : 'anchor')
                dispatch('active', newActive)
            }

            return onPageChange(onRouteChange)
        })

        const handleClick = (event: Event) => {
            event.preventDefault()
            event.stopPropagation()
            goToPage(props.path(), props.state(), props.title())
        }

        template`
			<a
				part="${part}"
				href="${props.path}"
				onclick="${handleClick}"
				>
				<slot></slot>
			</a>`
    }

    register<PageLinkProps>(PageLink, {
        path: '',
        title: '',
        state: {},
    })
}
