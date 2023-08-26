import {Props} from "../../types";
import {pathStringToPattern} from "../utils/path-string-to-pattern";
import {getPathMatchParams} from "../utils/get-path-match-params";
import {element} from "@beforesemicolon/html";
import {createContext, host, onMount, register, template} from "../../cube";
import pages from "../pages";

interface WithRouteProps {
	path: string;
	component: string;
	src: string;
}

const WithRoute = (props: Props<WithRouteProps>) => {
	const comp = host();
	
	if (props.path()) {
		const ctx = createContext("params", {}, {readonly: true});
		const path = pathStringToPattern(props.path())
		const slotName = String(Math.random());
		
		const temp = template`<slot ref="slot" name="${slotName}"></slot>`;
		
		const showContent = () => {
			temp.refs['slot'][0].removeAttribute("name")
		}
		
		const hideContent = () => {
			temp.refs['slot'][0].setAttribute("name", slotName);
		}
		
		const onRouteChange = (pathname: string) => {
			const params = getPathMatchParams(pathname, path.pattern, path.params);
			
			if (params !== null) {
				const componentTagName = props.component();
				ctx.update(params)
				
				if (componentTagName) {
					const el = element(componentTagName);
					
					comp.innerHTML = '';
					comp.appendChild(el);
					showContent();
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
				hideContent();
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
