<script>
    export let data;
    export let name = "Gyro";
    console.log(data)
    export let NT;
    import  "@frc-web-components/fwc/components/gyro"

    let valueTopic = NT.NTDouble(0.0, data[0]);
    // $: console.log($valueTopic)
</script>

<script context="module" lang="ts">
    import type { WidgetDefinition } from "../config";
    export let config : WidgetDefinition = {
        "name": "Gyro",
        "id": "gyro",
        "data": {
                type:"string",
                default:"/",
                description:""
            },
        "properties": {

        },
        layout:{
            minHeight: 4,
            minWidth:4
        }
    };
</script>

<frc-gyro style="width:100%; height:100%; background:white; display:block" value={$valueTopic} label={name}></frc-gyro>