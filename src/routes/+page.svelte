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
                    data: ["/a", "/b"],
                    layout:{
                        x: 0,
                        y: 0,
                        width:1,
                        height:2
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
    const result = loadLayoutFromJSON(original);

    // @ts-ignore
    const replacer = (key, a)=>{
        if(a.set && a.subscribe) {
            return get(a)
        }
        else return a
    }

    let inConfigMode = false;
    let selectedStore = writable("")
    let enableSelection= writable(false)

</script>

<div class="h-full w-full flex">
    <ConfigPanel layout={layout} selectedTab={0} bind:selectedStore expanded={$enableSelection}></ConfigPanel>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="flex-shrink w-[10px] h-full bg-slate-800" on:click={()=>$enableSelection = !$enableSelection}> >>></div>
    <div style="flex-grow:1">
        <SelectionLayer {enableSelection} bind:selectedStore tab={Object.values(layout)[0]} ></SelectionLayer>
    </div>

</div>

