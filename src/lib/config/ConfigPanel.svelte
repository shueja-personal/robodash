<script lang="ts">
    import { derived, get} from "svelte/store"
    import type { Writable } from "svelte/store";
    import type {Layout } from "../config";
    import { afterUpdate } from "svelte";
    import InputChip from '../form/InputChip.svelte';
	import { Input } from "postcss";
	import { Autocomplete } from "@skeletonlabs/skeleton";
	import DataSelector from "./DataSelector.svelte";
	import DataVariableChip from "$lib/form/DataVariableChip.svelte";
	import DataVariableTextInput from "$lib/form/DataVariableTextInput.svelte";
	import type { NTStore } from "$lib/util/NT";
    export let selectedTab : Writable<string>;
    export let selectedStore : Writable<string>;

    export let expanded = true;
    export let layout: Layout;
    let element = derived([selectedTab, selectedStore], ([tab, store])=>layout[tab]?.elements[store])
    let name: NTStore<string>
    let type: Writable<string>
    $: {
        name = $element?.name
        type = $element?.type
    }
    
    afterUpdate(()=>{
        console.log("updating config panel")})
    
</script>
<div style="width:300px; flex-shrink:0; height:100%; background-color: grey; padding:8px " class={expanded ? "" : "hidden"}>
    {#if $element !== undefined}
    <label class="label">
        <span>Name</span>
        <input class="input" id="nameInput" title="Input (text)" type="text" bind:value={$name} placeholder="Element Name" />
    </label>
    <DataVariableTextInput bind:targetStore={name}></DataVariableTextInput>
    {/if}
    <DataVariableChip></DataVariableChip>
    
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
