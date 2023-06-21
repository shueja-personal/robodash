<script>

    export const prerender = true
    export const ssr = false;
	import { get } from "svelte/store";
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
</script>

<div class="h-full w-full flex">
    <ConfigPanel layout={layout} selectedTab={0} expanded={inConfigMode}></ConfigPanel>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="flex-shrink w-[10px] h-full bg-slate-800" on:click={()=>inConfigMode = !inConfigMode}> >>></div>
    <div style="flex-grow:1">
        <SelectionLayer tab={Object.values(layout)[0]} ></SelectionLayer>
        <!-- <GridLayout cellHeight={50} cellWidth={50} showLines={true}>

             <DashboardRenderer layout={layout}></DashboardRenderer>
             {#if inConfigMode}
            <div style="position:absolute; top:0; left:0; width:{50 * 50}px; height: {50 * 50}">
                <SelectionLayer tab={subStore(layout, l=>l.tabs[0])} bind:selectedIndex></SelectionLayer>
            </div>
            {/if}
            
        </GridLayout> -->
    </div>

</div>

