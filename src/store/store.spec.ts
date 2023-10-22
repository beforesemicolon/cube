import {store} from '.';

interface Todo {
	id: number;
	text: string;
	completed: boolean;
}

describe('store', () => {
	const todoStore = store<Array<Todo>>('todos');
	
	it('should create store', () => {
		expect(todoStore).toHaveProperty('update')
		expect(todoStore).toHaveProperty('value')
		expect(todoStore).toHaveProperty('set')
		expect(todoStore).toHaveProperty('subscribe')
	});
	
	it('should set store', () => {
		todoStore.set([
			{id: 1, text: 'sample', completed: true},
		])
		
		expect(todoStore.value).toHaveLength(1)
		expect(todoStore.value).toEqual([{id: 1, text: 'sample', completed: true}])
	});
	
	it('should update store', () => {
		todoStore.update([
			{id: 1, text: 'test', completed: false},
		])
		
		expect(todoStore.value).toHaveLength(1)
		expect(todoStore.value).toEqual([{id: 1, text: 'test', completed: false}])
	});
	
	it('should ignore update if value is the same', () => {
		todoStore.update(todoStore.value)
		
		expect(todoStore.value).toHaveLength(1)
		expect(todoStore.value).toEqual([{id: 1, text: 'test', completed: false}])
	});
	
	it('should subscribe and unsubscribe', () => {
		const sub = jest.fn();
		
		const unsub = todoStore.subscribe(sub);
		
		expect(sub).toHaveBeenCalledTimes(1)
		expect(sub).toHaveBeenCalledWith(todoStore.value)
		
		sub.mockClear()
		
		todoStore.update([
			...(todoStore.value || []),
			{id: 2, text: 'test', completed: false},
		]);
		
		expect(sub).toHaveBeenCalledTimes(1)
		expect(todoStore.value).toHaveLength(2)
		
		sub.mockClear()
		
		unsub();
		
		todoStore.update([
			...(todoStore.value || []),
			{id: 3, text: 'test', completed: false},
		]);
		
		expect(sub).not.toHaveBeenCalled()
		expect(todoStore.value).toHaveLength(3)
	});
	
	it('should throw error if trying to create a store with same name', () => {
		expect(() => store<Array<Todo>>('todos')).toThrowError('Store "todos" already exists. Stores must be unique.')
	});
	
	it('should throw error if using non-function to subscribe', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
		expect(() => todoStore.subscribe(null)).toThrowError('Invalid store subscribe handler. Received "null" but expected a function.')
	});
	
	it('should clear store', () => {
		todoStore.update(null);
		
		expect(todoStore.value).toBeNull()
	});
})
