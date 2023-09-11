import {Cube, Props} from "../../types";
import {isOnPage} from "../utils/is-on-page";
import {onPageChange, goToPage} from "../pages";

interface PageLinkProps {
	path: string;
	title: string;
	state: Record<string, unknown>;
}

export default ({eventDispatch, onMount, register, template, useValue}: Cube) => {
	const PageLink = (props: Props<PageLinkProps>) => {
		const dispatch = eventDispatch();
		const [active, setActive] = useValue(false);
		const part = () => active() ? "anchor active" : "anchor";

		onMount(() => {
			const onRouteChange = () => {
				const newActive = isOnPage(props.path());
				setActive(newActive);
				dispatch("active", newActive);
			}

			return onPageChange(onRouteChange);
		})

		const handleClick = (event: Event) => {
			event.preventDefault();
			event.stopPropagation();
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
		path: "",
		title: "",
		state: {}
	});
}
