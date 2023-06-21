<script lang="ts">
    import { get } from "svelte/store";
    import type {Layout } from "../config";
    import { afterUpdate } from "svelte";

    export let selectedTab = 0;
    export let selectedIndex = 0;

    $: console.log(selectedIndex)
    export let expanded = true;
    export let layout: Layout;

    afterUpdate(()=>{
        console.log("updating config panel")})
</script>
{#if expanded}
<div style="width:300px; flex-shrink:0; height:100%; background-color: grey; padding:8px">
    <!-- <button on:click={()=>save()}> Save Layout</button>
    <button on:click={()=>addWidget(selectedTab,"fms-info")}>+</button>
<button on:click={()=>{
    console.log("deleting", selectedIndex);
    let indexToDelete = selectedIndex;
    selectedIndex = get(elements).length;
    
    elements.set(get(elements).toSpliced(indexToDelete, 1));
    
    //we need to manually update this because we might delete element 0 and need to relink to the new 0
    // without Svelte thinking selectedIndex changed.
    selectedElementStore = subStore(elements, e=>e[selectedIndex]);
    }}>Del</button>
{#key selectedIndex}
    {#if selectedIndex < $elements.length}
    <ElementConfig config={selectedElementStore}/>
    {/if}
{/key} -->
</div>
{/if}
