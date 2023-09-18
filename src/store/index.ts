import {Subscriber, Store, ListStore, ListStoreItemID, ObjectLiteral} from "../types";
import {TC, mergeObjects} from "../utils";

const subs: Record<string, Set<Subscriber<any>>> = {};
const stores: Record<string, Store<any> | ListStore<any>> = {};

const broadcast = <T>(data: T, storeName: string) => {
	requestAnimationFrame(() => {
		subs[storeName].forEach(sub => sub(data))
	});
}

const subscribe = <T>(sub: Subscriber<T>, storeName: string, data: T | null = null) => {
	if (TC.function(sub)) {
		subs[storeName].add(sub as Subscriber<unknown>);
		sub(data);
		
		return () => {
			subs[storeName].delete(sub as Subscriber<unknown>);
		}
	}
	
	throw new Error(`Invalid store subscribe handler. Received "${sub}" but expected a function.`)
}

/**
 * a simple store that allows anything to be stored
 * @param name
 * @param data
 * @param mapper
 */
export const store = <T>(name: string, data: T | null = null, mapper: (val: T) => T = v => v): Store<T> => {
	if (stores[name]) {
		throw new Error(`Store "${name}" already exists. Stores must be unique.`)
	}
	
	subs[name] = new Set();
	stores[name] = Object.freeze({
		get value(): T | null {
			return data;
		},
		update: (newData: T | null) => {
			if (newData !== data) {
				if (newData !== null) {
					data = mapper(mergeObjects(data, newData));
				} else {
					data = null;
				}
				
				broadcast(data, name);
			}
		},
		subscribe: (sub: Subscriber<T>) => subscribe<T>(sub, name, data)
	});
	
	return stores[name] as Store<T>;
}

const getItemIdValue = <T extends ObjectLiteral>(item: T, identifierName = "id"): ListStoreItemID | null => {
	if (TC.objectLiteral(item) && !TC.undefined(item[identifierName])) {
		return item[identifierName] ?? null;
	}
	
	return null
}

export const listStore = <T extends ObjectLiteral>(name: string, data: Array<T> = [], identifierName = "id"): ListStore<T> => {
	if (stores[name]) {
		throw new Error(`Store "${name}" already exists. Stores must be unique.`)
	}
	
	// shallow copy the data
	data = [...data];
	
	const keyedData: Array<[ListStoreItemID, T]> = data.map((item) => {
		return [getItemIdValue(item, identifierName) ?? crypto.randomUUID(), item];
	});
	
	const map: Map<unknown, T> = new Map(keyedData);
	
	const emit = () => broadcast(data, name);
	
	subs[name] = new Set();
	stores[name] = Object.freeze({
		createItem: (newItem: T): ListStoreItemID => {
			const id = getItemIdValue(newItem, identifierName) ?? crypto.randomUUID();
			map.set(id, newItem);
			data.push(newItem);
			emit();
			
			return id;
		},
		loadItems: (newItems: T[]) => {
			const ids: ListStoreItemID[] = []
			
			newItems.forEach((newItem) => {
				const id = getItemIdValue(newItem, identifierName) ?? crypto.randomUUID();
				map.set(id, newItem);
				data.push(newItem);
				ids.push(id);
			})
			
			ids.length && emit();
			
			return ids;
		},
		getItem: (id: ListStoreItemID): T | null => {
			return map.get(id) ?? null;
		},
		getItems: () => {
			return data;
		},
		updateItem: (id: ListStoreItemID, updatedItem: Partial<T>) => {
			const found = map.get(id);
			
			if (found) {
				updatedItem = mergeObjects(found, updatedItem) as T;
				map.set(id, updatedItem as T);
				const idx = data.indexOf(found);
				
				data[idx] = updatedItem as T;
				emit();
				
				return updatedItem;
			} else {
				throw new Error(`Failed to update item with ${identifierName} of "${id}". Item does not exist.`);
			}
		},
		deleteItem: (id: ListStoreItemID): ListStoreItemID => {
			if (map.has(id)) {
				map.delete(id);
				const idx = data.indexOf(map.get(id) as T);
				
				data.splice(idx, 1);
				emit();
				
				return id;
			} else {
				throw new Error(`Failed to delete item with ${identifierName} of "${id}". Item does not exist.`);
			}
		},
		deleteItems: (ids: ListStoreItemID[]): ListStoreItemID[] => {
			const beforeCount = map.size;
			const delIds: ListStoreItemID[] = []
			
			ids.forEach(id => {
				if (map.has(id)) {
					map.delete(id);
					const idx = data.indexOf(map.get(id) as T);
					
					data.splice(idx, 1);
					delIds.push(id)
				} else {
					console.error(`Failed to delete item with ${identifierName} of "${id}". Item does not exist.`);
				}
			})
			
			beforeCount !== map.size && emit()
			
			return delIds;
		},
		findItem: (filter: (item: T) => boolean): T | null => {
			for (let [_, item] of map) {
				if (filter(item)) {
					return item
				}
			}
			
			return null;
		},
		findItems: (filter: (item: T) => boolean): T[] => {
			const items: T[] = [];
			
			for (let [_, item] of map) {
				if (filter(item)) {
					items.push(item)
				}
			}
			
			return items;
		},
		subscribe: (sub: Subscriber<T[]>) => subscribe<T[]>(sub, name, data)
	})
	
	return stores[name] as ListStore<T>;
}
