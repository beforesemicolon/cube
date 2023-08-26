import {CurrentComponent, Context, ContextModel} from "./types";

const CONTEXT: WeakMap<HTMLElement, Context<unknown>> = new WeakMap();

const getContextHost = (name: string, ancestor: HTMLElement) => {
	const tagName = ancestor.tagName;
	
	while (ancestor) {
		if (!ancestor) {
			break;
		}
		
		if (ancestor instanceof ShadowRoot) {
			ancestor = ancestor.host as HTMLElement;
		}
		
		const host = CONTEXT.get(ancestor);
		
		if (host && host[name]) {
			return host[name];
		}
		
		// move this to the end so the component can find its own context first
		ancestor = ancestor.parentNode as HTMLElement;
	}
	
	if (!ancestor) {
		throw new Error(`Component "${tagName}" is not in context of "${name}"`)
	}
}

export default (currentComponent: () => CurrentComponent | null) => {
	const createContext = <T>(name: string, data: T, {readonly = false, reactive = true} = {}) => {
		const comp = currentComponent();
		
		if (comp) {
			if (!CONTEXT.has(comp.self)) {
				const subs: ContextModel<T>['subs'] = new Set();
				
				if (reactive) {
					subs.add(comp.contextUpdate)
				}
				
				CONTEXT.set(comp.self, {
					[name]: {
						readonly,
						getData() {
							return data
						},
						setData(newValue: T) {
							const oldValue = data;
							data = newValue;
							subs.forEach((sub) => sub(name, newValue, oldValue))
						},
						subs
					}
				} as Context<unknown>);
			} else {
				throw new Error(`A context named "${name}" already exists for this component`)
			}
			
			return useContext<T>(name, reactive);
		} else {
			throw new Error('Must NOT use "createContext" outside of a component')
		}
	}
	
	const useContext = <T>(name: string, reactive = true) => {
		const comp = currentComponent();
		
		if (comp) {
			const ctx = getContextHost(name, comp.self) ?? null;
			
			comp.contextMap.set(name, {
				reactive,
				ctx,
				inContext: true
			})
			
			if (reactive) {
				ctx?.subs.add(comp?.contextUpdate)
			}
			
			return {
				update: (newValue: T) => {
					const host = comp.contextMap.get(name);
					
					if (host?.inContext && host?.ctx) {
						host.ctx.setData(newValue);
					}
				},
				value: (): T | null => {
					const host = comp.contextMap.get(name);
					
					if (host && host.inContext) {
						return host?.ctx?.getData() as T;
					}
					
					return null;
				},
			}
		} else {
			throw new Error('Must NOT use "useContext" outside of a component')
		}
	}
	
	const onContextUpdate = (cb: (propName: string, newValue: unknown, oldValue: unknown) => void) => {
		const comp = currentComponent();
		
		if (comp) {
			comp.contextMap.forEach((val, name) => {
				// remove any sub added by useContext
				val.ctx?.subs.delete(comp.contextUpdate);
				// set a new contextUpdate so the onDestroy can clea it up
				comp.contextUpdate = (...args) => {
					val.reactive && comp?.template?.update();
					cb(...args)
				};
				// then override with this new contextUpdate
				val.ctx?.subs.add(comp.contextUpdate)
			})
		} else {
			throw new Error('Must NOT use "onMount" lifecycle outside of a component')
		}
	}
	
	return {
		createContext,
		useContext,
		onContextUpdate,
		getContextHost
	}
}
