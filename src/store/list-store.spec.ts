import {listStore} from "./index";

interface Todo {
	id: number;
	text: string;
	completed: boolean;
}

describe('listStore', () => {
	const todoStore = listStore<Todo>('todos', [
		{id: 1, text: 'test1', completed: false}
	]);
	
	it('should create store', () => {
		expect(todoStore).toHaveProperty('createItem')
		expect(todoStore).toHaveProperty('loadItems')
		expect(todoStore).toHaveProperty('getItem')
		expect(todoStore).toHaveProperty('getItems')
		expect(todoStore).toHaveProperty('updateItem')
		expect(todoStore).toHaveProperty('deleteItem')
		expect(todoStore).toHaveProperty('deleteItems')
		expect(todoStore).toHaveProperty('findItem')
		expect(todoStore).toHaveProperty('findItems')
		expect(todoStore).toHaveProperty('subscribe')
	});
	
	it('should create id for item without id', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
		const id = todoStore.createItem({text: 'test', completed: false});
		
		expect(todoStore.getItems()).toHaveLength(2)
		
		expect(todoStore.getItem(id)).toEqual({text: 'test', completed: false})
	});
	
	it('should create item', () => {
		todoStore.createItem({id: 2, text: 'test2', completed: false});
		
		expect(todoStore.getItems()).toHaveLength(3)
		expect(todoStore.getItem(2)).toEqual({id: 2, text: 'test2', completed: false})
	});
	
	it('should load items', () => {
		todoStore.loadItems([
			{id: 3, text: 'test3', completed: false},
			{id: 4, text: 'test4', completed: false},
		]);
		
		expect(todoStore.getItems()).toHaveLength(5)
	});
	
	it('should update item', () => {
		todoStore.updateItem(1, {completed: true});
		
		expect(todoStore.getItem(1)).toEqual({id: 1, text: 'test1', completed: true})
	});
	
	it('should throw error if trying to update item that does not exist', () => {
		expect(() => todoStore.updateItem(5, {completed: true})).toThrowError('Failed to update item with id of "5". Item does not exist.')
	});
	
	it('should find item(s)', () => {
		const item = todoStore.findItem(item => item.id === 1);
		
		expect(item).toEqual({id: 1, text: 'test1', completed: true})
		
		const items = todoStore.findItems(item => item.id === 2 || item.id === 4);
		
		expect(items).toEqual([
			{id: 2, text: 'test2', completed: false},
			{id: 4, text: 'test4', completed: false},
		])
		
		expect(todoStore.findItem(item => item.id === 6)).toBeNull()
		expect(todoStore.findItems(item => item.id === 6)).toEqual([])
	});
	
	it('should delete item(s)', () => {
		expect(todoStore.getItem(1)).not.toBeNull()
		
		let ids = todoStore.deleteItem(1);
		
		expect(ids).toEqual(1)
		expect(todoStore.getItems()).toHaveLength(4)
		expect(todoStore.getItem(1)).toBeNull()
		
		expect(todoStore.getItem(3)).not.toBeNull()
		expect(todoStore.getItem(4)).not.toBeNull()
		
		ids = todoStore.deleteItems([3, 4]);
		
		expect(ids).toEqual([3, 4])
		expect(todoStore.getItems()).toHaveLength(2)
		expect(todoStore.getItem(3)).toBeNull()
		expect(todoStore.getItem(4)).toBeNull()
		
		ids = todoStore.deleteItems([3, 4]);
		
		expect(ids).toEqual([])
	});
	
	it('should throw error if trying to delete item that does not exist', () => {
		jest.spyOn(console, 'error');
		expect(() => todoStore.deleteItem(5)).toThrowError('Failed to delete item with id of "5". Item does not exist.')
		expect(todoStore.deleteItems([6])).toEqual([])
		expect(console.error).toHaveBeenCalledWith('Failed to delete item with id of "6". Item does not exist.')
	});
	
	it('should throw error if trying to create a store with same name', () => {
		expect(() => listStore<Todo>('todos')).toThrowError('Store "todos" already exists. Stores must be unique.')
	});
	
	it('should throw error if using non-function to subscribe', () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
		expect(() => todoStore.subscribe(null)).toThrowError('Invalid store subscribe handler. Received "null" but expected a function.')
	});
})
