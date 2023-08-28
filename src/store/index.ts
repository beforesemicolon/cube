import {Subscriber, Store, ListStore} from "../types";

const subs: Record<string, Set<Subscriber<any>>> = {};
const stores: Record<string, Store<any> | ListStore<any>> = {};

const broadcast = <T>(data: T, storeName: string) => {
	requestAnimationFrame(() => {
		subs[storeName].forEach(sub => sub(data))
	});
}

const subscribe = <T>(sub: Subscriber<T>, storeName: string) => {
	if (typeof sub === "function") {
		subs[storeName].add(sub as Subscriber<unknown>);
		
		return () => {
			subs[storeName].delete(sub as Subscriber<unknown>);
		}
	}
	
	throw new Error(`Invalid store subscribe handler. Received ${sub} but expected a function.`)
}

export const store = <T>(name: string, data: T | null = null, mapper: (val: T) => T = v => v): Store<T> => {
	if (stores[name]) {
		throw new Error(`Store "${name}" already exists. Stores must be unique.`)
	}
	
	subs[name] = new Set();
	stores[name] = Object.freeze({
		value: (): Readonly<T> | null => data,
		update: (newData: T | null) => {
			if (newData !== data) {
				if (newData !== null) {
					data = mapper(newData);
				} else {
					data = null;
				}
				
				broadcast(data, name);
			}
		},
		subscribe: (sub: Subscriber<Readonly<T>>) => {
			subscribe(sub, name);
			sub(data);
		}
	});
	
	return stores[name] as Store<T>;
}

const getItemIdValue = <T>(item: T, identifierName = "id") => {
	if (item && typeof item === "object" && item.hasOwnProperty(identifierName)) {
		// @ts-ignore
		return item[identifierName] ?? null;
	}
	
	return null
}

export const listStore = <T>(name: string, data: Array<T> = [], identifierName = "id"): ListStore<T> => {
	if (stores[name]) {
		throw new Error(`Store "${name}" already exists. Stores must be unique.`)
	}
	
	// shallow copy the data
	data = [...data];
	
	const keyedData: Array<[string, T]> = data.map((item, idx) => {
		return [getItemIdValue(item, identifierName) ?? String(idx), item];
	});
	
	const map: Map<string, T> = new Map(keyedData);
	
	const emit = () => broadcast(data, name);
	
	subs[name] = new Set();
	stores[name] = Object.freeze({
		createItem: (newItem: T) => {
			const id = getItemIdValue(newItem, identifierName) ?? String(map.size + 1);
			map.set(id, newItem);
			data.push(newItem);
			console.log('-- createItem', data);
			emit();
		},
		loadItems: (newItems: T[]) => {
			newItems.forEach((newItem) => {
				const id = getItemIdValue(newItem, identifierName) ?? String(map.size + 1);
				map.set(id, newItem);
			})
			data.push(...newItems);
			emit();
		},
		getItem: (id: string): Readonly<T> | null => {
			return map.get(id) ?? null;
		},
		getItems: () => {
			return data;
		},
		updateItem: (id: string, updatedItem: T) => {
			const found = map.get(id);
			
			if (found) {
				map.set(id, updatedItem);
				const idx = data.indexOf(found);
				
				data[idx] = updatedItem;
				emit();
			} else {
				console.error(`Failed to update item of id of "${id}". Item does not exist.`);
			}
		},
		deleteItem: (id: string) => {
			if (map.has(id)) {
				map.delete(id);
				const idx = data.indexOf(map.get(id) as T);
				
				data.splice(idx, 1);
				emit();
			} else {
				console.error(`Failed to delete item of id of "${id}". Item does not exist.`);
			}
		},
		deleteItems: (ids: string[]) => {
			const beforeCount = map.size;
			
			ids.forEach(id => {
				if (map.has(id)) {
					map.delete(id);
					const idx = data.indexOf(map.get(id) as T);
					
					data.splice(idx, 1);
				} else {
					console.error(`Failed to delete item of id of "${id}". Item does not exist.`);
				}
			})
			
			if (beforeCount !== map.size) {
				emit();
			}
		},
		findItem: (filter: (item: T) => boolean): Readonly<T> | null => {
			for (let [_, item] of map) {
				if (filter(item)) {
					return item
				}
			}
			
			return null;
		},
		findItems: (filter: (item: T) => boolean): Readonly<T[]> => {
			const items: Readonly<T>[] = [];
			
			for (let [_, item] of map) {
				if (filter(item)) {
					items.push(item)
				}
			}
			
			return items;
		},
		subscribe: (sub: Subscriber<Readonly<T[]>>) => {
			subscribe(sub, name);
			sub(data);
		}
	})
	
	return stores[name] as ListStore<T>;
}
