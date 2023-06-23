<script lang="ts">
    import NT from "../util/NT";
    import type {DashboardElement} from "$lib/config"
	import { widgetDefinitions } from "$lib/widgets";
    export let config: DashboardElement;
    let {type, name, meta} = config;
</script>

<svelte:component this={widgetDefinitions[$type]} NT={NT} name={$name} {...meta[$type]}></svelte:component>