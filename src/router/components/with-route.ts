import {Props, Cube} from "../../types";
import {pathStringToPattern} from "../utils/path-string-to-pattern";
import {getPathMatchParams} from "../utils/get-path-match-params";
import {onPageChange} from "../pages";
import {isOnPage} from "../utils/is-on-page";

interface WithRouteProps {
	path: string;
	src: string;
}


export default ({createContext, host, onMount, register, template, element, html, when}: Cube) => {
	const WithRoute = (props: Props<WithRouteProps>) => {
		const comp = host();
		
		if (props.path()) {
			const ctx = createContext("params", {}, {readonly: true});
			const path = pathStringToPattern(props.path())
			const slotName = String(Math.random());
			const temp = template`
				<slot ref="slot" name="${slotName}"></slot>
				${when(() => props.src() && isOnPage(props.path()), html`<slot ref="loading" name="loading"><p>Loading...</p></slot>`)}
      `;
			let el: Element;
			
			const showContent = () => {
				temp.refs['slot'][0].removeAttribute("name")
			}
			
			const hideContent = () => {
				temp.refs['slot'][0].setAttribute("name", slotName);
			}
			
			const loadContent = (src: string) => {
				fetch(src)
					.then(res => {
						if (res.status === 200) {
							return res.text()
						}
						
						throw new Error(`Loading "${props.src()}" content failed with status code ${res.status}`);
					})
					.then(html => {
						temp.refs['loading'][0].remove();
						comp.innerHTML = html;
						showContent();
					})
					.catch(console.error)
			}
			
			const onRouteChange = (pathname: string) => {
				const params = getPathMatchParams(pathname, path.pattern, path.params);
				
				if (params !== null) {
					ctx.update(params)
					
					if (props.src()) {
						loadContent(props.src())
					} else {
						showContent();
					}
				} else {
					hideContent();
				}
			};
			
			onMount(() => {
				return onPageChange(onRouteChange);
			})
		}
	}
	
	register(WithRoute, {
		path: "",
		src: "",
	});
}
