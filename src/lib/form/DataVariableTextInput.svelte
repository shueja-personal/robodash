<script lang="ts">
    import {flip} from "svelte/animate";
    import {dndzone, TRIGGERS} from "svelte-dnd-action";
    import type {Options} from "svelte-dnd-action";
	import { get, writable, type Writable } from "svelte/store";
	import NT from "$lib/util/NT"
    import type { NTStore } from "$lib/util/NT";
    import {id} from "./NTChipDnd"
    export let targetStore : NTStore<string>

    let items : Array<StringNTChip> = [
        {id:id(), name:""}
    ];
    let options: Options;
    $: options = {
        items,
        flipDurationMs,
        dragDisabled: true
    }

    let displayItems = items
    const flipDurationMs = 300;

    function processItems(items: Array<StringNTChip>) {
        if (items.length) {
            // if a topic chip was dropped in, 
            targetStore.setTopic(items[0].name)
        }
        else {
            targetStore.clearTopic()
        }
    }
    processItems(items)
    function handleDndConsider(e:CustomEvent<DndEvent<StringNTChip>>) {
        
        items=e.detail.items
    }
    function handleDndFinalize(e:CustomEvent<DndEvent<StringNTChip>>) {
        console.log(e.detail)
        // filter down to only new items not found in existing items
        items = e.detail.items.filter((newItem)=> (displayItems.findIndex((existingItem)=> existingItem.id === newItem.id)) < 0)
        displayItems = items
        if (items.length > 0) {
            targetStore.setTopic(items[0].name)
        }


   }
</script>
<script context="module" lang="ts">
    export type StringNTChip = {
        id: number;
        name: string;
    }
</script>
<style>
    section {
        width: 100%;
        padding: 0.3em;
        border: 1px solid black;
        min-height: 30px;
        /* this will allow the dragged element to scroll the list */
        overflow: scroll;
    }
    div {

        padding: 0.2em;
        border: 1px solid blue;
        margin: 0.15em 0;
    }
</style>

<section use:dndzone={options} on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
    {$targetStore}
    {#each items as item(item.id)}
    <div animate:flip="{{duration: flipDurationMs}}">{item.name}</div>
    {/each}
</section>