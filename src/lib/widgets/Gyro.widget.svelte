<script lang="ts">
    export let source : NTStore<number>;
    export let name = "Gyro";
    export let NT;
    import  "@frc-web-components/fwc/components/gyro"
    // $: console.log($valueTopic)
    console.log($source)
</script>

<script context="module" lang="ts">
	import type { NTStore } from "$lib/util/NT";
    import type { WidgetDefinition } from "../config";
    export let config : WidgetDefinition = {
        "name": "Gyro",
        "id": "gyro",
        "properties": {
            "source":
                {
                displayName: "Source",
                type:"double",
                default: 0,
                description:"The amount to display on the gyro"
            },
        },
        layout:{
            minHeight: 4,
            minWidth:4
        }
    };
</script>

<frc-gyro style="width:100%; height:100%; background:white; display:block" value={$source} label={name}></frc-gyro>