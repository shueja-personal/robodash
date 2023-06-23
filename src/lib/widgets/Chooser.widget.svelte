<script>
    export let options;
    export let selected;
    export let active;
    export let name = "Chooser";
    import  "@frc-web-components/fwc/components/sendable-chooser"

    // let options = NT.NTStringArray([], `${data[0].replace(/\/$/, '')}/options`);
	// let selected = NT.NTString("", `${data[0].replace(/\/$/, '')}/selected`)
	// let active = NT.NTString("", `${data[0].replace(/\/$/, '')}/active`)
</script>
<script context="module" lang="ts">
    import type { WidgetDefinition } from "../config";
    export let config : WidgetDefinition = {
        "name": "Chooser",
        "id": "chooser",
        "properties": {
            "options":{
                displayName: "Options",
                type: "stringarray",
                default: ["No Options Available"],
                description: "The array of options",
            },
            "selected":{
                displayName: "Selected",
                type: "string",
                default: "No Options Available",
                description: "The selected option",
            },
            "active":{
                displayName: "Active",
                type: "string",
                default: "No Options Available",
                description: "The active option",
            },
        },
        "layout": {
            minHeight: 2,
            minWidth:4
        }
    };
</script>

<frc-sendable-chooser options={$options} active={$active} default={$active} label={name}
    on:change={(e)=>$selected= e.detail.selected}></frc-sendable-chooser>
