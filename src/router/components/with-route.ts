import {Props, Cube} from "../../types";
import {pathStringToPattern} from "../utils/path-string-to-pattern";
import {getPathMatchParams} from "../utils/get-path-match-params";
import {onPageChange} from "../pages";
import {isOnPage} from "../utils/is-on-page";

interface WithRouteProps {
	path: string;
	src: string;
}

enum Status {
	Idle,
	Loading,
	Loaded,
	LoadingFailed,
}

export default ({createContext, host, onMount, register, template, html, when, useValue}: Cube) => {
	const WithRoute = (props: Props<WithRouteProps>) => {
		const comp = host();
		
		if (props.path()) {
			const ctx = createContext("params", {}, {readonly: true});
			const path = pathStringToPattern(props.path())
			const slotName = String(Math.floor(Math.random() * 10000000000));
			const [status, setStatus] = useValue<Status>(Status.Idle);
			const loading = () => status() === Status.Loading;
			const loadingFailed = () => status() === Status.LoadingFailed;
			const notLoaded = () => status() !== Status.Loaded;
			
			template`
				<slot attr.name="${slotName} | ${notLoaded}"></slot>
				${when(loading, html`<slot name="loading"><p>Loading...</p></slot>`)}
				${when(loadingFailed, html`<slot name="fallback"></slot>`)}
      `;
			
			const loadContent = (src: string) => {
				setStatus(Status.Loading);
				fetch(src)
					.then(res => {
						if (res.status === 200) {
							return res.text()
						}
						
						throw new Error(`Loading "${props.src()}" content failed with status code ${res.status}`);
					})
					.then(html => {
						comp.innerHTML = html;
						setStatus(Status.Loaded);
					})
					.catch(err => {
						setStatus(Status.LoadingFailed);
						console.error(err)
					})
			}
			
			const onRouteChange = (pathname: string) => {
				const params = getPathMatchParams(pathname, path);
				
				if (params !== null) {
					ctx.update(params)
					
					if (props.src() && status() !== Status.Loading && status() !== Status.Loaded) {
						loadContent(props.src());
					} else {
						setStatus(Status.Loaded);
					}
				} else {
					setStatus(Status.Idle);
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
