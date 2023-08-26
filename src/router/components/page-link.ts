import {Props} from "../../types";
import {eventDispatch, onMount, register, template, useValue} from "../../cube";
import {goToPreviousPage} from "../go-to-previous-page";
import {searchParamsToJson} from "../utils/search-params-to-json";
import {isSamePath} from "../utils/is-same-path";
import pages from "../pages";
import {goToPage} from "../go-to-page";

interface PageLinkProps {
	path: string;
	title: string;
	state: Record<string, unknown>;
	previous: boolean;
}

const PageLink = (props: Props<PageLinkProps>) => {
	const dispatch = eventDispatch();
	
	const [disabled, setDisabled] = useValue(pages.length === 1);
	const isDisabled = () => props.previous() && disabled();
	const isActive = () => isSamePath(props.path())
	
	onMount(() => {
		const onRouteChange = () => {
			setDisabled(pages.length === 1);
			!props.previous() && dispatch("active", isActive());
		}
		
		return pages.subscribe(onRouteChange);
	})
	
	const handleClick = (event: Event) => {
		event.preventDefault();
		event.stopPropagation();
		
		if (props.previous()) {
			goToPreviousPage();
		} else {
			const [path, searchPart = ""] = props.path().split('?');
			
			if (path) {
				goToPage(path, {
					title: props.title() || document.title,
					state: props.state(),
					search: searchParamsToJson(searchPart)
				})
			}
		}
	}
	
	template`
		<a
			part="anchor"
			href="${props.path}"
			onclick="${handleClick}"
			attr.class.active="${isActive}"
			attr.style="opacity: 0.5; cursor: not-allowed; pointer-events: none; | ${isDisabled}"
			>
			<slot></slot>
		</a>`
}

register<PageLinkProps>(PageLink, {
	path: "",
	title: "",
	state: {},
	previous: false
});
