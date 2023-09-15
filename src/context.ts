import {CurrentComponent, Context, ContextModel} from "./types";
import {TC} from "./utils";

const CONTEXT: WeakMap<HTMLElement, Context<unknown>> = new WeakMap();

const getContextHost = (name: string, ancestor: HTMLElement) => {
	const tagName = ancestor.tagName;
	
	while (ancestor) {
		if (!ancestor) {
			break;
		}
		
		if (TC.type(ancestor, ShadowRoot)) {
			ancestor = (ancestor as unknown as ShadowRoot).host as HTMLElement;
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
	const createContext = <T>(name: string, data: T, {readonly = true, reactive = false} = {}) => {
		const comp = currentComponent();
		
		if (comp) {
			const subs: ContextModel<T>['subs'] = new Set();
			
			if (!CONTEXT.has(comp.self)) {
				CONTEXT.set(comp.self, {});
			}
			
			if ((CONTEXT.get(comp.self) as Context<T>)[name]) {
				throw new Error(`A context named "${name}" already exists for this component`)
			}
			
			if (reactive) {
				subs.add(comp.contextUpdate)
			}
			
			(CONTEXT.get(comp.self) as Context<T>)[name] = {
				readonly,
				getData() {
					return data
				},
				setData(newValue: T) {
					if (!readonly) {
						const oldValue = data;
						data = newValue;
						subs.forEach((sub) => sub(name, newValue, oldValue))
					}
				},
				subs
			};
			
			const ctx = useContext<T>(name, reactive);
			
			return {
				...ctx,
				update: (newValue: T) => {
					const oldValue = data;
					data = newValue;
					subs.forEach((sub) => sub(name, newValue, oldValue))
				},
			};
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
					
					if (host?.inContext && host?.ctx && !host.ctx.readonly) {
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
			throw new Error('Must NOT use "onContextUpdate" lifecycle outside of a component')
		}
	}
	
	return {
		createContext,
		useContext,
		onContextUpdate,
		getContextHost
	}
}
