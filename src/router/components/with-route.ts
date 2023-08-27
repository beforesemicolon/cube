import {Props, Cube} from "../../types";
import {pathStringToPattern} from "../utils/path-string-to-pattern";
import {getPathMatchParams} from "../utils/get-path-match-params";
import pages from "../pages";

interface WithRouteProps {
	path: string;
	component: string;
	src: string;
}


export default ({createContext, host, onMount, register, template, element}: Cube) => {
	const WithRoute = (props: Props<WithRouteProps>) => {
		const comp = host();
		
		if (props.path()) {
			const ctx = createContext("params", {}, {readonly: true});
			const path = pathStringToPattern(props.path())
			const slotName = String(Math.random());
			const temp = template`<slot ref="slot" name="${slotName}"></slot>`;
			let el: Element;
			
			const showContent = () => {
				temp.refs['slot'][0].removeAttribute("name")
			}
			
			const hideContent = () => {
				temp.refs['slot'][0].setAttribute("name", slotName);
			}
			
			const onRouteChange = (pathname: string) => {
				const params = getPathMatchParams(pathname, path.pattern, path.params);
				const componentTagName = props.component();
				
				if (params !== null) {
					ctx.update(params)
					
					if (componentTagName) {
						el = el ?? element(componentTagName);
						
						// match the slot name so it can be rendered
						el.setAttribute("slot", slotName)
						!el.isConnected && comp.appendChild(el);
						hideContent();
					} else if (props.src()) {
						fetch(props.src())
							.then(res => res.text())
							.then(html => {
								comp.innerHTML = html;
								showContent();
							})
							.catch(console.error)
					} else {
						showContent();
					}
				} else {
					if (componentTagName) {
						el.removeAttribute("slot")
					} else {
						hideContent();
					}
				}
			};
			
			onMount(() => {
				return pages.subscribe(onRouteChange);
			})
		}
	}
	
	register(WithRoute, {
		path: "",
		component: "",
		src: "",
	});
}
