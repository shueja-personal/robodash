<script>

    export const prerender = true
    export const ssr = false;
	import { get, writable } from "svelte/store";
    import {loadLayoutFromJSON, layout} from "../lib/config"
    import ConfigPanel from "../lib/config/ConfigPanel.svelte"
	import SelectionLayer from "$lib/select/SelectionLayer.svelte";

    const original = {tabs:[
        {
            name: "Tab",
            elements: [
                {
                    name: "Chooser",
                    type: "chooser",
                    layout:{
                        x: 0,
                        y: 0,
                        width:1,
                        height:2
                    },
                    meta: {
                        chooser: {
                            active: {
                                topic: "/active",
                                default: "Not Connected"
                            }
                        }
                    }
                },
                {
                    name: "Gyro",
                    type: "gyro",
                    data: ["/a", "/b"],
                    layout:{
                        x: 0,
                        y: 0,
                        width:1,
                        height:2
                    }
                },

            ]
        }
    ]

    }
    loadLayoutFromJSON(original);

    // @ts-ignore
    const replacer = (key, a)=>{
        if(a.set && a.subscribe) {
            return get(a)
        }
        else return a
    }

    let selectedStore = writable("")
    let selectedTab = writable(Object.keys(layout)[0]);
    let enableSelection= writable(true)

</script>

<div class="h-full w-full flex">
    
    <ConfigPanel layout={layout} selectedTab={selectedTab} bind:selectedStore expanded={$enableSelection}></ConfigPanel>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="flex-shrink w-[10px] h-full bg-slate-800" on:click={()=>$enableSelection = !$enableSelection}> >>></div>
    <div style="flex-grow:1">
        {#if !$enableSelection}
        {JSON.stringify(layout, replacer, '\t')}
        {/if}
        <SelectionLayer {enableSelection} bind:selectedStore tab={Object.values(layout)[0]} ></SelectionLayer>
    </div>

</div>

