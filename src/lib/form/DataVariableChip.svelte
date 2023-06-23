<script lang="ts">
    //@ts-nocheck
    import {flip} from "svelte/animate";
    import {dndzone, TRIGGERS, SHADOW_ITEM_MARKER_PROPERTY_NAME} from "svelte-dnd-action";
    import {id as getNewId} from "./NTChipDnd"
    import {get} from "svelte/store"
	import NT from "$lib/util/NT";

    let topics = NT.keys;

    function difference<T>(a1:T[], a2:T[]) : T[] {
    var a2Set = new Set(a2);
    return a1.filter(function(x) { return !a2Set.has(x); });
    }
    
    let prevTopics: string[]  = []
    let items = []
    $: {
        items = [...items, ...difference($topics, prevTopics).map(name=>{
            console.log("update");
            return {id: getNewId(), name}
        })]
        prevTopics = get(topics)
        }
    const flipDurationMs = 0;
    let shouldIgnoreDndEvents = false;
    function handleDndConsider(e) {
        const {trigger, id} = e.detail.info;
        if (trigger === TRIGGERS.DRAG_STARTED) {
            const idx = items.findIndex(item => item.id === id);
            const newId = getNewId();
						// the line below was added in order to be compatible with version svelte-dnd-action 0.7.4 and above 
					  e.detail.items = e.detail.items.filter(item => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
            e.detail.items.splice(idx, 0, {...items[idx], id: newId});
            items = e.detail.items;
            shouldIgnoreDndEvents = true;
        }
        else if (!shouldIgnoreDndEvents) {
            items = e.detail.items;
        }
        else {
            items = [...items];
        }
    }
    function handleDndFinalize(e) {
        if (!shouldIgnoreDndEvents) {
            items = e.detail.items;
        }
        else {
            items = [...items];
            shouldIgnoreDndEvents = false;
        }
    }
</script>

<style>
    section {
        width: 50%;
        padding: 0.3em;
        border: 1px solid black;
        /* this will allow the dragged element to scroll the list */
        overflow: scroll;
        height: 200px;
    }
    div {
        width: 50%;
        padding: 0.2em;
        border: 1px solid blue;
        margin: 0.15em 0;
    }
</style>
<section use:dndzone={{items, flipDurationMs, dropFromOthersDisabled: true, morphDisabled:true}} on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
    {#each items as item(item.id)}
    <div animate:flip="{{duration: flipDurationMs}}">{item.name}</div>
    {/each}
</section>