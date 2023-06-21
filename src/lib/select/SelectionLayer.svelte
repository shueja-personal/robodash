<script lang="ts">
    import {layout} from '../config';
    import type {DashboardTab, DashboardElement} from '../config'
    import { derived, get, writable, type Writable } from "svelte/store";
    import Grid from "svelte-grid";
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import { widgetDefinitions } from '../widgets';
	import WidgetWrapper from './WidgetWrapper.svelte';
    export let tab : DashboardTab;
    export let selectedStore: Writable<string>;
    export let enableSelection: Writable<boolean>;
	
    const createGridConfigStore = (element:DashboardElement, uuid:string) => {
        return derived(
            [enableSelection, selectedStore,
                element.type, element.layout.x, element.layout.y,
                element.layout.height, element.layout.width], 
            ([enableSelection, selected, type, x, y, height, width]) => {
                console.log(type, x, y, width, height)
                return {x: (x??1)-1, y: (y??1)-1, h:height, w:width, 
                    fixed:(selected !== uuid) || !enableSelection,
                    draggable:(selected === uuid) && enableSelection,
                    resizable:(selected === uuid) && enableSelection,
                    id:uuid,
                    min: {w: widgetDefinitions[type]?.config.layout?.minWidth,
                    h: widgetDefinitions[type]?.config.layout?.minHeight},
                    }
                }
        )
    }
    const COLS = 48

    let elementStores = Object.keys(tab.elements)
            .map((uuid)=>(createGridConfigStore(tab.elements[uuid], uuid)));
    const itemStore = derived(
        elementStores,
        (elementArray)=>{
            console.log(elementArray)
            //@ts-ignore
            let output: any[] = []
            elementArray.forEach((element)=>{output.push({[COLS]:gridHelp.item(element), id: element.id})})
            console.log(output)
            return output;
        }
    )

    let modifiedItems: any[]= get(itemStore);
    $: $itemStore, modifiedItems = $itemStore;
    const cols = [[2400, COLS]]
    console.log(get(itemStore))
    const handleChange = (e)=>{
        let elementData = modifiedItems.find(item=>item.id===e.detail.id)?.[COLS]
        let elementStores = tab.elements[elementData.id]
        console.log(elementStores)
        elementStores.layout.x.set(elementData.x + 1)
        elementStores.layout.y.set(elementData.y + 1)
        elementStores.layout.width.set(elementData.w)
        elementStores.layout.height.set(elementData.h)


        
    }
console.log(tab.elements)
</script>
<div style="width:2400px; max-width: 1200px">

<Grid bind:items={modifiedItems} rowHeight={50} gap={[0,0]} let:dataitem let:item {cols} on:pointerup={handleChange}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div style="background:red" class="h-full w-full" on:mouseover={()=>$selectedStore = item.id} on:mousedown={()=>$selectedStore = item.id}>
        {#if true} <!--we need this block for the consts-->
        {@const config = tab.elements[item.id]} 
       <WidgetWrapper {config}></WidgetWrapper>
        {/if}
    </div>
</Grid>
</div>

