<script>
	import { get } from "svelte/store";
    import {loadLayoutFromJSON, layout} from "../lib/config"

    const original = {tabs:[
        {
            name: "Tab",
            elements: [
                {
                    name: "Gyro",
                    type: "gyro",
                    data: ["/a", "/b"],
                    layout:1
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
</script>
Input file
<pre>{JSON.stringify(original, null, '\t')}</pre>
Output
{JSON.stringify(result)}
<br>
<br>
<pre>{JSON.stringify(layout, replacer, '\t')}</pre>

