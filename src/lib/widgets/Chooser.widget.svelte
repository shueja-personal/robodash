<script>
    export let NT;
    export let data;
    export let name = "Chooser";
    import  "@frc-web-components/fwc/components/sendable-chooser"
    let options = NT.NTStringArray([], `${data[0].replace(/\/$/, '')}/options`);
	let selected = NT.NTString("", `${data[0].replace(/\/$/, '')}/selected`)
	let active = NT.NTString("", `${data[0].replace(/\/$/, '')}/active`)
</script>
<script context="module" lang="ts">
    import type { WidgetDefinition } from "../config";
    export let config : WidgetDefinition = {
        "name": "Chooser",
        "id": "chooser",
        "data": {
                type: "string",
                default: "/",
                description: "The path to the NT table for the chooser"
            },
        "properties": {
            
        },
        "layout": {
            minHeight: 2,
            minWidth:4
        }
    };
</script>

<frc-sendable-chooser options={$options} active={$active} default={$active} label={name}
    on:change={(e)=>$selected= e.detail.selected}></frc-sendable-chooser>
