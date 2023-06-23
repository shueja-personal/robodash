<script lang="ts">
	import type { Writable } from "svelte/store";
    import InputChip from "../form/InputChip.svelte";
    import { Autocomplete } from "@skeletonlabs/skeleton";
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    let dataInput = ''
    export let data: Writable<string[]>

let keys = [
    "/DataA",
    "/The/Quick/Brown/Fox"
].map((key)=>({label:key, value:key}))
let onDataInputChipSelect = (e: {detail: {label:any; value:any;}})=> {data.set([...$data, e.detail.value])}
let popupSettings: PopupSettings = {
	event: 'focus-click',
	target: 'popupAutocomplete',
	placement: 'right',
};
</script>

<InputChip {popupSettings} usePopup={true}
    bind:input={dataInput} bind:value={$data} name="Data" allowUpperCase allowDuplicates={false}></InputChip>
<Autocomplete
    class="bg-surface-800"
    bind:input={dataInput}
    options={keys}
    on:selection={onDataInputChipSelect}>
</Autocomplete>

