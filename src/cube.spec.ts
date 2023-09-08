import {
	eventDispatch,
	host,
	onAdoption,
	onDestroy,
	onDOMUpdate,
	onError,
	onMount,
	onUpdate,
	register,
	template,
	useValue
} from "./cube";
import {updateConfig} from './config';
import {Props, ShadowRootMode} from "./types";
import {element, html} from "@beforesemicolon/html";
import {render} from './testing/render';

describe('cube', () => {
	
	beforeEach(() => {
		updateConfig({
			mode: ShadowRootMode.OPEN,
			delegatesFocus: false,
			lang: 'en',
			onError: console.error
		})
	})
	
	it('should register component', () => {
		jest.spyOn(customElements, 'define');
		
		const MyComponent = () => {};
		
		const res = register(MyComponent);
		
		const calls = (customElements.define as jest.Mock).mock.calls;
		
		expect(calls).toHaveLength(1);
		expect(calls[0][0]).toEqual(res.tagName);
	});
	
	it('should update config', () => {
		const OneComponent = () => {};
		const TwoComponent = () => {};
		const ThreeComponent = () => {};
		
		updateConfig({
			mode: ShadowRootMode.NONE
		})
		
		const one = register(OneComponent);
		
		updateConfig({
			mode: ShadowRootMode.CLOSED,
			delegatesFocus: true
		})
		
		const two = register(TwoComponent);
		
		updateConfig({
			mode: ShadowRootMode.OPEN
		})
		
		const three = register(ThreeComponent);
		
		expect(one.mode).toBe('none')
		expect(two.mode).toBe('closed')
		expect(two.delegatesFocus).toBe(true)
		expect(three.mode).toBe('open')
		expect(three.delegatesFocus).toBe(true)
	});
	
	it('should handle lifecycles', () => {
		const mountMock = jest.fn();
		const destroyMock = jest.fn();
		const adoptionMock = jest.fn();
		const updateMock = jest.fn();
		const domUpdateMock = jest.fn();

		interface ButtonProps {
			type: "button" | "submit";
			label: string;
		}

		const MyButton = ({type, label}: Props<ButtonProps>) => {
			template`<button type="${type}">${label}</button>`

			onMount(mountMock)
			onUpdate(updateMock)
			onDOMUpdate(domUpdateMock)
			onDestroy(destroyMock)
			onAdoption(adoptionMock)
			onAdoption(adoptionMock)
		}
		
		const res = render(MyButton, {type: "button", label: "click me"})

		expect(`${res}`).toBe('<my-button></my-button>')
		expect(res.content).toBe('<button type="button">click me</button>')

		expect(mountMock).toHaveBeenCalledTimes(1);
		
		res.target?.setAttribute("type", "submit");

		expect(res.content).toBe('<button type="submit">click me</button>')
		expect(updateMock).toHaveBeenCalledTimes(1);
		
		res.target?.setAttribute("label", "clicked");
		
		expect(res.content).toBe('<button type="submit">clicked</button>')
		expect(updateMock).toHaveBeenCalledTimes(2);

		const iframe = element('iframe') as HTMLIFrameElement;
		document.body.appendChild(iframe);

		iframe.contentDocument?.body.appendChild(res.target as Element)

		expect(destroyMock).toHaveBeenCalledTimes(1);
		expect(adoptionMock).toHaveBeenCalledTimes(1);
		expect(mountMock).toHaveBeenCalledTimes(2);

		res.target?.remove()

		expect(destroyMock).toHaveBeenCalledTimes(2);
	});
	
	it('should use onMount returned function as onDestroy', () => {
	
	});
	
	it('should handle props update via element reference', () => {
	
	});
	
	it('should handle error with onError', () => {
		const errMock = jest.fn();
		
		const ErrorComponent = () => {
			onError(errMock);
			
			throw new Error("Failed")
		}
		
		render(ErrorComponent)
		
		expect(errMock).toHaveBeenCalledWith(new Error("Failed"))
	});
	
	it('should handle error with global onError', () => {
		const errMock = jest.fn();
		
		updateConfig({
			onError: errMock
		})
		
		const GlobalErrorComponent = () => {
			throw new Error("Failed")
		}
		
		render(GlobalErrorComponent)
		
		expect(errMock).toHaveBeenCalledWith(new Error("Failed"))
	
	});
	
	it('should dispatch event with eventDispatch', () => {
		const EventComponent = () => {
			const dispatch = eventDispatch();
			
			template`<button onclick="${() => dispatch('clicked')}">click me</button>`
		}
		
		const cont = render(EventComponent);
		
		expect(cont.content).toBe('<button>click me</button>')
		
		const clickMock = jest.fn();
		
		cont.target?.addEventListener('clicked', clickMock)
		
		cont.find('button')[0].target?.click()
		
		expect(clickMock).toHaveBeenCalledTimes(1);
		expect(clickMock).toHaveBeenCalledWith(new CustomEvent("clicked"));
	});
	
	it('should update template on change with useValue', () => {
		const ChangeComponent = () => {
			const [count, setCount] = useValue(0);
			
			template`<button onclick="${() => setCount(count() + 1)}">${count}</button>`
		}
		
		const cont = render(ChangeComponent);
		
		expect(cont.content).toBe('<button>0</button>')
		
		cont.find('button')[0].target?.click()
		
		expect(cont.content).toBe('<button>1</button>')
	});
	
	it('should render content with template', () => {
		const RenderComponent = () => {
			const el = element("p", {textContent: "sample"})
			const markup = html`<div>content</div>`
			
			template`${el}<button>click me</button>${markup}`
		}
		
		const cont = render(RenderComponent);
		
		expect(cont.content).toBe('<p>sample</p><button>click me</button><div>content</div>')
	});
	
	it('should have reference of the component with host', () => {
		const hostMock = jest.fn();
		
		const HostComponent = () => {
			const comp = host();
			
			hostMock(comp);
		}
		
		const res = render(HostComponent)
		
		expect(hostMock).toHaveBeenCalledWith(res.target)
	});
	
	describe('should catch errors in', () => {
		it('style handler', () => {});
		it('prop update', () => {});
		it('mount handler', () => {});
		it('dom update handler', () => {});
		it('destroy handler', () => {});
		it('adoption handler', () => {});
		it('context setup', () => {});
	})

	describe("should throw error if", () => {
		it('function with no name is provided to register', () => {
			expect(() => register(() => {})).toThrowError('Component render function must have a name')
		});
		
		it('onDestroy is used outside component', () => {
			expect(() => onDestroy(() => {})).toThrowError('Must NOT use "onDestroy" lifecycle outside of a component')
		});

		it('onMount is used outside component', () => {
			expect(() => onMount(() => {})).toThrowError('Must NOT use "onMount" lifecycle outside of a component')
		});

		it('onUpdate is used outside component', () => {
			expect(() => onUpdate(() => {})).toThrowError('Must NOT use "onUpdate" lifecycle outside of a component')
		});
		
		it('onDOMUpdate is used outside component', () => {
			expect(() => onDOMUpdate(() => {})).toThrowError('Must NOT use "onDOMUpdate" lifecycle outside of a component')
		});
		
		it('onAdoption is used outside component', () => {
			expect(() => onAdoption(() => {})).toThrowError('Must NOT use "onAdoption" lifecycle outside of a component')
		});

		it('onError is used outside component', () => {
			expect(() => onError(() => {})).toThrowError('Must NOT use "onError" lifecycle outside of a component')
		});

		it('template is used outside component', () => {
			expect(() => template`sample`).toThrowError('Must NOT use "template" outside of a component')
		});

		it('eventDispatch is used outside component', () => {
			expect(() => eventDispatch()).toThrowError('Must NOT use "eventDispatch" outside of a component')
		});

		it('useValue is used outside component', () => {
			expect(() => useValue(12)).toThrowError('Must NOT use "useValue" outside of a component')
		});
		
		it('host is used outside component', () => {
			expect(() => host()).toThrowError('Must NOT use "host" outside of a component')
		});
	})
	
	it('should handle CSS string', () => {
		const CSSComponentStyle = () => {
			return `:host {display: block}`
		}
		
		const CSSComponent = () => {
			template`content`
		}
		
		const cont = render(CSSComponent, {}, CSSComponentStyle);
		
		expect(cont.content).toBe('<style class="css-component">:host {display: block}</style>content')
		
		const CSSComponentStyle2 = () => {
			return `<style>:host {display: block}</style>`
		}
		
		const CSSComponent2 = () => {
			template`content`
		}
		
		const cont2 = render(CSSComponent2, {}, CSSComponentStyle2);
		
		expect(cont2.content).toBe('<style class="css-component">:host {display: block}</style>content')
	});
	
	it('should handle CSS JSON', () => {
		const JSONComponentStyle = () => {
			return {
				":host": {
					display: 'block'
				}
			}
		}
		
		const JSONComponent = () => {
			template`content`
		}
		
		const cont = render(JSONComponent, {}, JSONComponentStyle);
		
		expect(cont.content).toBe('<style class="json-component">:host {display: block;}</style>content')
	});
	
	it('should handle style with none mode', () => {
		const JSONComponentStyle = () => {
			return {
				":host": {
					display: 'block'
				}
			}
		}
		
		const JSONGlobalComponent = () => {
			template`content`
		}
		
		const cont = render(JSONGlobalComponent, {}, JSONComponentStyle, {mode: ShadowRootMode.NONE});
		
		expect(cont.content).toBe('content');
		expect(document.head.querySelector('style[class="json-global-component"]')?.outerHTML)
			.toBe('<style class="json-global-component">json-global-component {display: block;}</style>');
	});
	
	it('should update style on props change', () => {
	
	});
	
	it('should handle passing primitive to a component', () => {
		const ChildComp = ({val}: Props<{val: number}>) => {
			template`${val}`
		}
		
		const ParentComp = () => {
			template`<child-comp val="12"></child-comp>`
		}
		
	  register(ChildComp, {val: 0});
		
		const parent = render(ParentComp)
		
		expect(parent.content).toBe('<child-comp val="12"></child-comp>')
		expect(parent.find('child-comp')[0].content).toBe('12')
	});
	
	it('should handle passing non-primitive to a component', () => {
		const DeepComp = ({val}: Props<{val: {sample: string}}>) => {
			template`${() => val().sample}`
		}
		
		const TopComp = () => {
			template`<deep-comp val="${{sample: 12}}"></deep-comp>`
		}
		
		register<{val: {sample: string}}>(DeepComp, {
			val: {
				sample: ""
			}
		})
		const el = render(TopComp)
		
		expect(el.content).toBe('<deep-comp val="{&quot;sample&quot;:12}"></deep-comp>')
		expect(el.find('deep-comp')[0].content).toBe('12')
	});
	
	it('should get references of elements from template', () => {
		const refMock = jest.fn();
		
		const RefComponent = () => {
			const el = element("p", {textContent: "sample"})
			const markup = html`<div ref="content">content</div>`
			
			const temp = template`${el}<button ref="btn">click me</button>${markup}`;
			
			refMock(temp.refs)
		}
		
		const cont = render(RefComponent);
		
		expect(cont.content).toBe('<p>sample</p><button>click me</button><div>content</div>')
		
		expect(refMock).toHaveBeenCalledWith({
			btn: expect.any(Array),
			content: expect.any(Array),
		})
	});
	
	it('should handle context', () => {
	
	});
	
	it('should return a string representation of component content', () => {
	
	});
})

