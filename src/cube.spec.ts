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
	template, useContext, createContext, onContextUpdate, refs,
} from "./cube";
import {updateConfig} from './config';
import {Props, ShadowRootMode, ObjectLiteral} from "./types";
import {element, html, state, when} from "@beforesemicolon/markup";
import {render, wait, waitFor} from './testing';

describe('cube', () => {
	const onErrorMock = jest.fn();
	
	beforeEach(() => {
		onErrorMock.mockClear();
		updateConfig({
			mode: ShadowRootMode.OPEN,
			delegatesFocus: false,
			lang: 'en',
			onError: onErrorMock
		})
	})
	
	it('should register component', () => {
		jest.spyOn(customElements, 'define');
		
		const MyComponent = () => {
		};
		
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
		const res = register(MyComponent, null);
		
		const calls = (customElements.define as jest.Mock).mock.calls;
		
		expect(calls).toHaveLength(1);
		expect(calls[0][0]).toEqual(res.tagName);
	});
	
	it('should update config', () => {
		const OneComponent = () => {
		};
		const TwoComponent = () => {
		};
		const ThreeComponent = () => {
		};
		
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
	
	it('should handle lifecycles', async () => {
		const initMock = jest.fn();
		const mountMock = jest.fn();
		const destroyMock = jest.fn();
		const adoptionMock = jest.fn();
		const updateMock = jest.fn();
		const domUpdateMock = jest.fn();
		
		interface ButtonProps extends ObjectLiteral {
			type: "button" | "submit";
			label: string;
		}
		
		const MyButton = ({type, label}: Props<ButtonProps>) => {
			initMock();
			template`<button type="${type}">${label}</button>`
			
			onMount(mountMock)
			onUpdate(updateMock)
			onDOMUpdate(domUpdateMock)
			onDestroy(destroyMock)
			onAdoption(adoptionMock)
			onAdoption(adoptionMock)
		}
		
		const res = await render<ButtonProps>(MyButton, {type: "button", label: "click me"})
		
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
		expect(initMock).toHaveBeenCalledTimes(1);
	});
	
	it('should use onMount returned function as onDestroy', async () => {
		const mountMock = jest.fn();
		const destroyMock = jest.fn();
		const DestroyComp = () => {
			onMount(() => {
				mountMock();
				return destroyMock
			})
		}
		
		const res = await render(DestroyComp);
		
		res.unmount();
		
		expect(mountMock).toHaveBeenCalledTimes(1);
		expect(destroyMock).toHaveBeenCalledTimes(1);
	});
	
	it('should handle props update via element reference', async () => {
		const updateMock = jest.fn();
		const ValComp = () => {
			onUpdate(updateMock)
		}
		
		const res = await render<{ val: number }>(ValComp, {val: 12});
		
		expect(res.target.val).toBe(12);
		
		res.target.val = 20;
		
		expect(res.target.val).toBe(20);
		
		expect(updateMock).toHaveBeenCalledTimes(1);
		expect(updateMock).toHaveBeenCalledWith("val", 20, 12);
	});
	
	it('should handle error with onError', async () => {
		const errMock = jest.fn();
		
		const ErrorComponent = () => {
			onError(errMock);
			
			throw new Error("Failed")
		}
		
		await render(ErrorComponent)
		
		expect(errMock).toHaveBeenCalledWith(new Error("Failed"))
	});
	
	it('should handle error with global onError', async () => {
		const errMock = jest.fn();
		
		updateConfig({
			onError: errMock
		})
		
		const GlobalErrorComponent = () => {
			throw new Error("Failed")
		}
		
		await render(GlobalErrorComponent)
		
		expect(errMock).toHaveBeenCalledWith(new Error("Failed"))
		
	});
	
	it('should dispatch event with eventDispatch', async () => {
		const EventComponent = () => {
			const dispatch = eventDispatch();
			
			template`<button onclick="${() => dispatch('clicked')}">click me</button>`
		}
		
		const cont = await render(EventComponent);
		
		expect(cont.content).toBe('<button>click me</button>')
		
		const clickMock = jest.fn();
		
		cont.target?.addEventListener('clicked', clickMock)
		
		cont.find('button')[0].target?.click()
		
		expect(clickMock).toHaveBeenCalledTimes(1);
		expect(clickMock).toHaveBeenCalledWith(new CustomEvent("clicked"));
	});
	
	it('should update template on change with state', async () => {
		const ChangeComponent = () => {
			const [count, setCount] = state(0);
			
			template`<button onclick="${() => setCount(count() + 1)}">${count}</button>`
		}
		
		const cont = await render(ChangeComponent);
		
		expect(cont.content).toBe('<button>0</button>')
		
		cont.find('button')[0].target?.click()
		
		expect(cont.content).toBe('<button>1</button>')
	});
	
	it('should render content with template', async () => {
		const RenderComponent = () => {
			const el = element("p", {textContent: "sample"})
			const markup = html`
				<div>content</div>`
			
			template`${el}<button>click me</button>${markup}`
		}
		
		const cont = await render(RenderComponent);
		
		expect(cont.content).toBe('<p>sample</p><button>click me</button><div>content</div>')
	});
	
	it('should have reference of the component with host', async () => {
		const hostMock = jest.fn();
		
		const HostComponent = () => {
			const comp = host();
			
			hostMock(comp);
		}
		
		const res = await render(HostComponent)
		
		expect(hostMock).toHaveBeenCalledWith(res.target)
	});
	
	describe('should catch errors in', () => {
		it('style handler', async () => {
			const StyleError = () => {}
			
			await render(StyleError, {}, () => {
				throw new Error('err in style');
			})
			
			expect(onErrorMock).toHaveBeenCalledWith(new Error('err in style'));
		});
		
		it('prop update', async () => {
			const UpdateError = () => {
				onUpdate(() => {
					throw new Error('err in update');
				})
			}
			
			const cont = await render(UpdateError, {x: 10})
			
			cont.target.x = 20;
			
			expect(onErrorMock).toHaveBeenCalledWith(new Error('err in update'));
		});
		
		it('mount handler', async () => {
			const MountError = () => {
				onMount(() => {
					throw new Error('err in mount');
				})
			}
			
			await render(MountError)
			
			expect(onErrorMock).toHaveBeenCalledWith(new Error('err in mount'));
		});
		
		it.skip('dom update handler', async () => {
			const DOMUpdateError = (props: Props<{ x: number }>) => {
				onDOMUpdate(() => {
					throw new Error('err in dom update');
				})
				
				template`${props.x}`
			}
			
			const cont = await render(DOMUpdateError, {x: 10})
			
			cont.target.x = 20;
			
			expect(onErrorMock).toHaveBeenCalledWith(new Error('err in update'));
		});
		
		it('destroy handler', async () => {
			const DestroyError = () => {
				onDestroy(() => {
					throw new Error('err in destroy');
				})
			}
			
			const cont = await render(DestroyError)
			
			cont.unmount();
			
			expect(onErrorMock).toHaveBeenCalledWith(new Error('err in destroy'));
		});
		
		it('adoption handler', async () => {
			const AdoptionError = () => {
				onAdoption(() => {
					throw new Error('err in adoption');
				})
			}
			
			const cont = await render(AdoptionError)
			
			const iframe = element('iframe') as HTMLIFrameElement;
			document.body.appendChild(iframe);
			
			iframe.contentDocument?.body.appendChild(cont.target)
			
			expect(onErrorMock).toHaveBeenCalledWith(new Error('err in adoption'));
		});
	})
	
	describe("should throw error if", () => {
		it('function with no name is provided to register', () => {
			expect(() => register(() => {
			})).toThrowError('Component render function must have a name')
		});
		
		it('onDestroy is used outside component', () => {
			expect(() => onDestroy(() => {
			})).toThrowError('Must NOT use "onDestroy" lifecycle outside of a component')
		});
		
		it('onMount is used outside component', () => {
			expect(() => onMount(() => {
			})).toThrowError('Must NOT use "onMount" lifecycle outside of a component')
		});
		
		it('onUpdate is used outside component', () => {
			expect(() => onUpdate(() => {
			})).toThrowError('Must NOT use "onUpdate" lifecycle outside of a component')
		});
		
		it('onDOMUpdate is used outside component', () => {
			expect(() => onDOMUpdate(() => {
			})).toThrowError('Must NOT use "onDOMUpdate" lifecycle outside of a component')
		});
		
		it('onAdoption is used outside component', () => {
			expect(() => onAdoption(() => {
			})).toThrowError('Must NOT use "onAdoption" lifecycle outside of a component')
		});
		
		it('onError is used outside component', () => {
			expect(() => onError(() => {
			})).toThrowError('Must NOT use "onError" lifecycle outside of a component')
		});
		
		it('template is used outside component', () => {
			expect(() => template`sample`).toThrowError('Must NOT use "template" outside of a component')
		});
		
		it('useContext is used outside component', () => {
			expect(() => useContext('sample')).toThrowError('Must NOT use "useContext" outside of a component')
		});
		
		it('createContext is used outside component', () => {
			expect(() => createContext('sample', {})).toThrowError('Must NOT use "createContext" outside of a component')
		});
		
		it('onContextUpdate is used outside component', () => {
			expect(() => onContextUpdate(() => {})).toThrowError('Must NOT use "onContextUpdate" lifecycle outside of a component')
		});
		
		it('eventDispatch is used outside component', () => {
			expect(() => eventDispatch()).toThrowError('Must NOT use "eventDispatch" outside of a component')
		});
		
		it('host is used outside component', () => {
			expect(() => host()).toThrowError('Must NOT use "host" outside of a component')
		});
		
		it('context with same name already exists', async () => {
			const InvalidCtx = () => {
				const ctx1 = createContext('ctx1', {});
				const ctx2 = createContext('ctx1', {});
			}
			
			await render(InvalidCtx);
			
			expect(onErrorMock).toHaveBeenCalledWith(new Error('A context named "ctx1" already exists for this component'))
		});
		
		it('component is not in context', async () => {
			const NotInCtxOne = () => {
				const ctx1 = useContext('ctx');
				
				template`${ctx1.value}`;
			}
			
			const WrapperCtxComp = () => {
				template`<not-in-ctx></not-in-ctx>`;
			}
			
			await render(NotInCtxOne);
			await render(WrapperCtxComp);
			
			expect(onErrorMock).toHaveBeenCalledWith(new Error('Component "not-in-ctx-one" is not in context of "ctx"'))
		});
	})
	
	it('should handle CSS string', async () => {
		const CSSComponentStyle = () => {
			return `:host {display: block}`
		}
		
		const CSSComponent = () => {
			template`content`
		}
		
		const cont = await render(CSSComponent, {}, CSSComponentStyle);
		
		expect(cont.content).toBe('<style class="CUBE-css-component">:host {display: block}</style>content')
		
		const CSSComponentStyle2 = () => {
			return `<style>:host {display: block}</style>`
		}
		
		const CSSComponent2 = () => {
			template`content`
		}
		
		const cont2 = await render(CSSComponent2, {}, CSSComponentStyle2);
		
		expect(cont2.content).toBe('<style class="CUBE-css-component2">:host {display: block}</style>content')
	});
	
	it('should handle CSS JSON', async () => {
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
		
		const cont = await render(JSONComponent, {}, JSONComponentStyle);
		
		expect(cont.content).toBe('<style class="CUBE-json-component">:host {display: block;}</style>content')
	});
	
	it('should handle style with none mode', async () => {
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
		
		const cont = await render(JSONGlobalComponent, {}, JSONComponentStyle, {mode: ShadowRootMode.NONE});
		
		expect(cont.content).toBe('content');
		expect(document.head.querySelector('style[class="CUBE-json-global-component"]')?.outerHTML)
			.toBe('<style class="CUBE-json-global-component">json-global-component {display: block;}</style>');
	});
	
	it('should update style on props change', async () => {
		interface CompProps extends ObjectLiteral {
			disabled: boolean;
		}
		
		const StyledCompStyle = jest.fn((props: Props<CompProps>) => {
			return {
				":host": {
					opacity: props.disabled() ? "0.5" : "1"
				}
			}
		})
		const StyledComp = () => {
		}
		
		const cont = await render<CompProps>(StyledComp, {disabled: false}, StyledCompStyle);
		
		expect(StyledCompStyle).toHaveBeenCalledTimes(1)
		
		expect(cont.content).toBe('<style class="CUBE-styled-comp">:host {opacity: 1;}</style>')
		
		cont.target.disabled = true;
		
		expect(StyledCompStyle).toHaveBeenCalledTimes(2)
		expect(cont.content).toBe('<style class="CUBE-styled-comp">:host {opacity: 0.5;}</style>')
	});
	
	it('should handle passing primitive to a component', async () => {
		const ChildComp = ({val}: Props<{ val: number }>) => {
			template`${val}`
		}
		
		const ParentComp = () => {
			template`<child-comp val="12"></child-comp>`
		}
		
		register(ChildComp, {val: 0});
		
		const parent = await render(ParentComp)
		
		expect(parent.content).toBe('<child-comp val="12"></child-comp>')
		expect(parent.find('child-comp')[0].content).toBe('12')
	});

	
	it('should handle passing non-primitive value to a component', async () => {
		const DeepComp = ({val}: Props<{ val: { sample: string } }>) => {
			template`${() => val().sample}`
		}
		
		const TopComp = () => {
			template`<deep-comp val="${{sample: 12}}"></deep-comp>`
		}
		
		register<{ val: { sample: string } }>(DeepComp, {
			val: {
				sample: ""
			}
		})
		const el = await render(TopComp)
		
		expect(el.content).toBe('<deep-comp val="{&quot;sample&quot;:12}"></deep-comp>')
		expect(el.find('deep-comp')[0].content).toBe('12')
	});

	it('should handle passing non-primitive value to a conditionally rendering component', async () => {
		type obj = { sample: { x: 12} | null }

		const ObjValue = (props: Props<obj>) => {
			template`${() => props.sample()?.x}`
		}

		const MainApp = () => {
			const [obj, setObj] = state<obj['sample']>(null);

			onMount(() => {
				setTimeout(() => {
					setObj({x: 12})
				}, 1000)
			})

			template`${when(obj, html`<obj-value sample="${obj}"></obj-value>`)}`
		}


		register<obj>(ObjValue, {sample: null});
		const el = await render(MainApp)

		expect(el.content).toBe('')

		await wait(1000)

		expect(el.content).toBe('<obj-value sample="{&quot;x&quot;:12}"></obj-value>')
		expect(el.find('obj-value ')[0].content).toBe('12')
	});

	it('should get references of elements from template', async () => {
		const refMock = jest.fn();
		
		const RefComponent = () => {
			const ref = refs()
			const el = element("p", {textContent: "sample"})
			const markup = html`
				<div ref="content">content</div>`
			
			template`${el}<button ref="btn">click me</button>${markup}`;
			
			onMount(() => {
				refMock(ref('btn')[0])
				refMock(ref('content')[0])
			})
		}
		
		const cont = await render(RefComponent);
		
		expect(cont.content).toBe('<p>sample</p><button>click me</button><div>content</div>')
		
		expect(refMock).toHaveBeenCalledWith(expect.any(HTMLButtonElement))
		expect(refMock).toHaveBeenCalledWith(expect.any(HTMLDivElement))
	});
	
	describe('should handle context', () => {
		const CtxUserComp = () => {
			const ctx = useContext("sample");
			
			template`<button onclick="${() => ctx.update(20)}">${ctx.value}</button>`;
		}
		
		register(CtxUserComp);
		
		it('if readonly', async () => {
			const CtxReadComp = () => {
				const ctx = createContext("sample", 12);
			}
			
			register(CtxReadComp);
			
			const cont = await render(html`<ctx-read-comp><ctx-user-comp></ctx-user-comp></ctx-read-comp>`);
			
			const ctxUserCompBtn = cont.find('ctx-user-comp')[0].find('button')[0];
			
			expect(ctxUserCompBtn.content).toBe('12');
			
			ctxUserCompBtn.target.click();
			
			expect(ctxUserCompBtn.content).toBe('12');
		});
		
		it('if writable', async () => {
			const ctxUpdateMock = jest.fn();
			const CtxWriteComp = () => {
				const ctx = createContext("sample", 12, {readonly: false});
				
				onContextUpdate(ctxUpdateMock)
				
				template`${ctx.value}`;
			}
			
			register(CtxWriteComp);
			
			const cont = await render(html`<ctx-write-comp><ctx-user-comp></ctx-user-comp></ctx-write-comp>`);
			
			const ctxComp = cont.find('ctx-write-comp')[0];
			const ctxUserCompBtn = cont.find('ctx-user-comp')[0].find('button')[0];
			
			expect(ctxComp.content).toBe('12');
			expect(ctxUserCompBtn.content).toBe('12');
			
			ctxUserCompBtn.target.click();
			
			expect(ctxComp.content).toBe('12');
			expect(ctxUserCompBtn.content).toBe('20');
			expect(ctxUpdateMock).toHaveBeenCalledWith("sample", 20, 12)
		});
		
		it('if reactive', async () => {
			const CtxReactiveComp = () => {
				const ctx = createContext("sample", 12, {readonly: false, reactive: true});
				
				template`${ctx.value}`;
			}
			
			register(CtxReactiveComp);
			
			const cont = await render(html`<ctx-reactive-comp><ctx-user-comp></ctx-user-comp></ctx-reactive-comp>`);
			
			const ctxComp = cont.find('ctx-reactive-comp')[0];
			const ctxUserCompBtn = cont.find('ctx-user-comp')[0].find('button')[0];
			
			expect(ctxComp.content).toBe('12');
			expect(ctxUserCompBtn.content).toBe('12');
			
			ctxUserCompBtn.target.click();
			
			expect(ctxComp.content).toBe('20');
			expect(ctxUserCompBtn.content).toBe('20');
		});
	})
	
})
