import {Cube, Props} from "../../types";
import {isSamePath} from "../utils/is-same-path";
import pages from "../pages";

interface PageLinkProps {
	path: string;
	title: string;
	state: Record<string, unknown>;
}

export default ({eventDispatch, onMount, register, template, useValue}: Cube) => {
	const PageLink = (props: Props<PageLinkProps>) => {
		const dispatch = eventDispatch();

		const isActive = () => isSamePath(props.path())

		onMount(() => {
			let previousActive = isSamePath(props.path());

			const onRouteChange = () => {
				const newActive = isActive();

				if (previousActive !== newActive) {
					dispatch("active", newActive);
				}
			}

			return pages.subscribe(onRouteChange);
		})

		const handleClick = (event: Event) => {
			event.preventDefault();
			event.stopPropagation();

			const [path, searchPart = ""] = props.path().split('?');

			if (path) {
				pages.add(path, props.state(), props.title())
			}
		}

		template`
			<a
				part="anchor"
				href="${props.path}"
				onclick="${handleClick}"
				attr.class.active="${isActive}"
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
