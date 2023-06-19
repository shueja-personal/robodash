import type{ ComponentType, SvelteComponentTyped } from "svelte"
import { writable, type Writable } from "svelte/store"
import {v4 as uuid} from "uuid"

export type WidgetDefinition = {
    name:String,
    id:String,
    data: PropertyDefinition<"string" | "stringarray">,
    properties:{

        [key:string]:PropertyDefinition<PropertyType>
    },
    layout?: {
        minWidth?: number,
        minHeight?: number
    }
}

export type PropertyType = "string" | "stringarray"  |
"integer" | "integerarray" | 
"boolean" | "booleanarray" |
 "double" | "doublearray"

export interface PropertyTypeMap {
    "string": string, "stringarray": Array<string>,
    "integer": number, "integerarray": Array<number>,
    "double" : number, "doublearray" : Array<number>,
    "boolean" : boolean, "booleanarray" : Array<boolean>
}

export const propertyTypes = ["string", "stringarray","integer", "integerarray", 
"boolean", "booleanarray", "double", "doublearray"]

export type PropertyDefinition<T extends PropertyType> = {
    type: T,
    default: PropertyTypeMap[T]
    description?: string,
    displayName?: string
}


export type ComponentWithConfig = ComponentType<SvelteComponentTyped> & {config: WidgetDefinition}

export type WidgetRegistry = {[key:string] : ComponentWithConfig}


// For the global layout state
export type Layout = {
    [uuid:string]:DashboardTab
}
export type DashboardTab = {
    name: Writable<string>,
    elements: {[key:string]:DashboardElement}
}
export type DashboardElement = {
    name: Writable<string>,
    type: Writable<string>, // The type declaration has less specificity than the schema because we might add elements at runtime
    data: Writable<Array<string>>,
    layout: ElementLayout,
    meta?: {
        [key: string]:Object;   
    }
}
export type ElementLayout = {
    x: Writable<number | undefined>,
    y: Writable<number | undefined>,
    width: Writable<number>,
    height: Writable<number>
}

let isObject = (obj:any) : obj is Object => {return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]'}

export const loadLayoutFromJSON = (input: Object) : Layout | {errors: string[], warnings: string[]} => {
    let errors : Array<string> = [];
    let warnings: Array<string> = [];
    let config :Layout = {}
    if (!('tabs' in input)) {errors.push('Input did not have "tabs" property'); return {errors, warnings};}
    if (!(Array.isArray(input.tabs))) {errors.push('Input tabs was not an array'); return {errors, warnings};}
    let tabs : Array<Object> = input.tabs.filter((tab)=>{
        let isAnObject = isObject(tab);
        if(!(isAnObject)) {warnings.push('Tab list had non-object item, skipping');}
        return isAnObject;
    });
    // defining a type predicate specifically for input.tabs
    // Iterate through tabs
    let tabIdx = 0;
    for (let inputTab of tabs) {
        let outputTab : DashboardTab = {
            name: writable(""),
            elements: {}
        }
        let name: string;
        // setting the name;
        if (!('name' in inputTab && typeof inputTab.name === 'string')) {
            name = `New Tab ${tabIdx++}`
        } else {
            name = inputTab.name
        }
        outputTab.name.set(name)
        // checking the elements list;
        if (
            !('elements' in inputTab && Array.isArray(inputTab.elements))
        ) {warnings.push(`[${name}] Element list was not an array`); continue;}

        // filtering non-object elements
        let elements : Array<Object> = inputTab.elements.filter((element)=>{
            let isAnObject = isObject(element);
            if(!isAnObject) {warnings.push(`[${name}] Elements had non-object item, skipping`);}
            return isAnObject;
        });
        
        for (let element of elements) {
            let outputElement :DashboardElement= {
                name: writable(""),
                type: writable(""),
                data: writable([""]),
                layout: {
                    x: writable(undefined),
                    y: writable(undefined),
                    width: writable(1),
                    height: writable(1)
                }
            }
            // TODO add type checking against known widgets.
            if (!('type' in element && typeof element.type === 'string')) {
                warnings.push(`[${name}] An element was missing a string type, skipping`); continue;
            }
            outputElement.type.set(element.type)
            let elementName = ""
            if (!('name' in element && typeof element.name === 'string')) {
                elementName = element.type; // TODO use widget definition display name;
            } else {elementName = element.name}
            outputElement.name.set(elementName)
            // Data sources
            if (!('data' in element)) {
                warnings.push (`[${name}] [${elementName}] Data sources missing.`);
                outputElement.data.set([])
            } else {
                // ensure is string array
                if (Array.isArray(element.data) && element.data.every((source)=> (typeof source === 'string'))) {
                    outputElement.data.set(element.data as string[])
                } else if (typeof element.data === 'string') {
                    // if simple string, encapsulate in array
                    outputElement.data.set([element.data])
                } else {
                    warnings.push (`[${name}] [${elementName}] Data sources were neither string nor string array`);
                    outputElement.data.set([])
                }
            }

            //layout
            let mins = {x: 1, y: 1, width: 1, height: 1}
            if (!('layout' in element && isObject(element.layout))){
                warnings.push(`[${name}] [${elementName}] Layout malformed`)
                outputElement.layout.x.set(mins.x);
                outputElement.layout.y.set(mins.y);
                outputElement.layout.width.set(mins.width);
                outputElement.layout.height.set(mins.height);
            } else {
                // TODO min width/height
                if ('x' in element.layout && typeof element.layout.x === 'number'){
                    outputElement.layout.x.set(Math.max(mins.x, element.layout.x))
                } else {outputElement.layout.x.set(mins.x)}

                if ('y' in element.layout && typeof element.layout.y === 'number'){
                    outputElement.layout.y.set(Math.max(mins.y, element.layout.y))
                } else {outputElement.layout.y.set(mins.y)}

                if ('width' in element.layout && typeof element.layout.width === 'number'){
                    outputElement.layout.width.set(Math.max(mins.width, element.layout.width))
                } else {outputElement.layout.width.set(mins.width)}

                if ('height' in element.layout && typeof element.layout.height === 'number'){
                    outputElement.layout.height.set(Math.max(mins.height, element.layout.height))
                } else {outputElement.layout.height.set(mins.height)}
            }
            outputTab.elements[uuid()] = outputElement
        


            
        }
        config[uuid()] = outputTab
    }
    if (errors.length == 0) {
        layout = config
    }
    return {errors, warnings}
}
export let layout : Layout = {

}