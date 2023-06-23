import type{ ComponentType, SvelteComponentTyped } from "svelte"
import { writable, type Writable } from "svelte/store"
import {v4 as uuid} from "uuid"
import NT, { type NetworkTablesTypes, type NTStoreTypes } from "./util/NT"
import type {NTStore} from "./util/NT"
import { widgetDefinitions } from "./widgets"

export type WidgetDefinition = {
    name:String,
    id:String,
    properties?:{

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
    name: NTStore<string>,
    type: Writable<string>, // The type declaration has less specificity than the schema because we might add elements at runtime
    layout: ElementLayout,
    meta: {
        [key: string]:{
            [key:string]: NTStoreTypes
        };   
    }
}
export type ElementLayout = {
    x: NTStore<number>,
    y: NTStore<number>,
    width: NTStore<number>,
    height: NTStore<number>
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
                name: NT.NTString(""),
                type: writable(""),
                layout: {
                    x: NT.NTInt(1),
                    y: NT.NTInt(1),
                    width: NT.NTInt(1),
                    height: NT.NTInt(1)
                },
                meta: {}
            }
            // TODO add type checking against known widgets.
            if (!('type' in element && typeof element.type === 'string')) {
                warnings.push(`[${name}] An element was missing a string type, skipping`); continue;
            }
            if (!(element.type in widgetDefinitions)) {
                warnings.push(`[${name}] An element had an unknown type, skipping`); continue;
            }
            outputElement.type.set(element.type)
            let elementName = ""
            if (!('name' in element && typeof element.name === 'string')) {
                elementName = element.type; // TODO use widget definition display name;
            } else {elementName = element.name}
            outputElement.name.set(elementName)
            // Data sources
            let keysToProcess :string[] = []
            if(('meta') in element) {
                if (!isObject(element.meta)) {
                    warnings.push (`[${name}] [${elementName}] Meta was not an object`);
                    element.meta = {}
                }
                else {
                    keysToProcess = Object.keys(element.meta);
                }
            }
            
            
            if (!keysToProcess.includes(element.type)) keysToProcess.push(element.type)
            keysToProcess.forEach(key=> { // Key is a widget type or other string
                if (key in widgetDefinitions) {// Then it's a known widget
                    
                    outputElement.meta[key] = {};
                    let widgetProps = widgetDefinitions[key].config?.properties
                    if (widgetProps === undefined) {return;}
                     // if the widget has no properties, move on.
                    // for each property, create an NT-bound store;
                    Object.keys(widgetProps).forEach((prop) => {
                        if (widgetProps === undefined) {return;}
                        let propDefinition = widgetProps[prop]
                       
                        let propConfig = element?.meta?.[key]?.[prop]
                        let topic: string | undefined;
                        let defaultVal: any;
                        if (!isObject(propConfig)) { // prop config is missing or malformed
                            if (propConfig !== undefined) { // prop exists in widget def, not in config
                                warnings.push (`[${name}] [${elementName}] [${prop}] Property config was not an object`);

                            } else {
                                topic = undefined;
                                defaultVal = propDefinition.default
                            }
                        }else {
                            // if propConfig.topic is a string, use it as the NT key
                            if ('topic' in propConfig && typeof propConfig.topic === 'string') {
                                topic = propConfig.topic
                            }
                            if ('default' in propConfig) {
                                defaultVal = propConfig.default
                            }
                        }
                        console.log(topic)
                        let type = propDefinition.type.toString()
                        let propStore: NTStoreTypes; 
                        let isBool = (val: any)=> (val === true || val === false)
                        let isInt = Number.isInteger
                        let isDouble = Number.isFinite
                        let isString = (val: any)=> (typeof val === 'string')
                        let isArray = Array.isArray
                        let isArrayType = (validator: (val:any) => boolean) => (
                            (val:any) => isArray(val) && val.every(validator)
                        )
                        let validators : {[key: string]: {validate: (val:any)=>boolean, fn: (init:any, key:string | undefined)=>NTStoreTypes}} = {
                            "boolean":      {validate: isBool,                fn: (init:boolean, key:string | undefined)=>NT.NTBoolean(init, key)},
                            "integer":      {validate: isInt,                 fn: (init:number, key:string | undefined)=>NT.NTInt(init, key)},
                            "double":       {validate: isDouble,              fn: (init:number, key:string | undefined)=>NT.NTDouble(init, key)},
                            "string":       {validate: isString,              fn: (init:string, key:string | undefined)=>NT.NTString(init, key)},
                            "booleanarray": {validate: isArrayType(isBool),   fn: (init:boolean[], key:string | undefined)=>NT.NTBooleanArray(init, key)},
                            "integerarray": {validate: isArrayType(isInt),    fn: (init:number[], key:string | undefined)=>NT.NTIntArray(init, key)},
                            "doublearray":  {validate: isArrayType(isDouble), fn: (init:number[], key:string | undefined)=>NT.NTDoubleArray(init, key)},
                            "stringarray":  {validate: isArrayType(isString), fn: (init:string[], key:string | undefined)=>NT.NTStringArray(init, key)},
                        }
                        if (!validators[type].validate(defaultVal)) {
                            defaultVal = propDefinition.default
                        }
                        propStore = validators[type].fn(defaultVal, topic)
                        outputElement.meta[key][prop] = propStore
                    }
                    )
                }
            }
            )

            //layout
            let mins = {x: 1, y: 1,
                width: widgetDefinitions[element.type]?.config.layout?.minWidth ?? 1,
                height: widgetDefinitions[element.type]?.config.layout?.minHeight ?? 1}
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