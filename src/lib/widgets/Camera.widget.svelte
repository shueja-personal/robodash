<script lang="ts">
    export let NT;
    export let name: string;
    export let data: string[];
    export let resolutionX: number;
</script>

<script context="module" lang="ts">
    import type { WidgetDefinition } from "../config";
    export let config : WidgetDefinition = {
        "name": "Camera Stream",
        "id": "camera",
        "data": {
                type:"string",
                default:"about:blank",
                description:"The IP of the camera stream"
            },
        "properties": {

            "resolutionX": {
                type:"integer",
                default:640,
                description:"The horizontal width (px) of the stream",
                displayName: "X Resolution"
            }
        }
    };
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<iframe src={data[0] ?? ""} style="width:100%; height:100%" title={name}>{resolutionX}</iframe>