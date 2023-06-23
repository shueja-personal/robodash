// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { DndEvent, Item } from 'svelte-dnd-action';
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	declare type Item = {
		id: any;
		[k:string]: any;
	}
	declare type DndEvent<ItemType = Item> {
		items: ItemType[];
		info: DndEventInfo<Item>;
	};
	export interface DndEventInfo<T extends Item> {
		trigger: TRIGGERS; // the type of dnd event that took place
		id: number;
		source: SOURCES; // the type of interaction that the user used to perform the dnd operation
	}
	declare namespace svelte.JSX {
		interface HTMLAttributes<T> {
			onconsider?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
			onfinalize?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
		}
	}

	declare type PubSubClient {
		topics;
	}
}

export {};
