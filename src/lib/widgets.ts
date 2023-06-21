// For visual checking against component list in components/widgets, keep these in alpha order
import * as CameraWidget from "./widgets/Camera.widget.svelte";
import * as ChooserWidget from "./widgets/Chooser.widget.svelte";
import * as DifferentialDrivebaseWidget from "./widgets/DifferentialDrivebase.widget.svelte";
import * as FMSInfoWidget from "./widgets/FMSInfo.widget.svelte";
import * as GraphWidget from "./widgets/Graph.widget.svelte";
import * as GyroWidget from "./widgets/Gyro.widget.svelte";
import * as TimerWidget from "./widgets/Timer.widget.svelte";

import {appDataDir, sep} from '@tauri-apps/api/path'
import {createDir, BaseDirectory, readTextFile, readBinaryFile, readDir} from '@tauri-apps/api/fs'


import type { ComponentType, SvelteComponent, SvelteComponentTyped } from "svelte";
import type { WidgetDefinition, WidgetRegistry } from "./config";

type ImportedWidget = {
    default: ComponentType<SvelteComponentTyped>,
    config: WidgetDefinition
}

export let widgetDefinitions : WidgetRegistry = {
    // "gyro": Object.assign(GyroWidget, {config: GyroWidgetConfig}),
    // "chooser": addImportedWidget(),
    // "fms-info": Object.assign(FMSInfoWidget, {config: FMSInfoWidgetConfig}),
    // "camera": Object.assign(CameraWidget, {config: CameraWidgetConfig}),
}

export let addImportedWidget = (widget: ImportedWidget) => {
    let component = widget.default;
    let config = widget.config;
    let id = widget.config.id.toString();
    widgetDefinitions[id] = Object.assign(component, {config});
}

// For visual checking against component list in components/widgets, keep these in alpha order

addImportedWidget(CameraWidget);
addImportedWidget(ChooserWidget);
//addImportedWidget(DifferentialDrivebaseWidget);
addImportedWidget(FMSInfoWidget);
//addImportedWidget(GraphWidget);
addImportedWidget(GyroWidget);
//addImportedWidget(TimerWidget);





createDir('plugins', {dir: BaseDirectory.AppData, recursive:true})
appDataDir().then((dir)=>console.error(dir))

let loadPlugin = (filename: string) => {
	return readBinaryFile(`plugins${sep}${filename}`, {
		dir: BaseDirectory.AppData,
	}).then((result)=>{
		const blob = new Blob([result.buffer], {
			type: "application/javascript",
		  });
		  const url = URL.createObjectURL(blob)
		  return url;
	})
	.then((url)=>{return import(/* @vite-ignore */ url)})
	.then(result=>{addImportedWidget(result)})
	.catch((reason)=>console.error(reason))
}
export const loadPlugins = 
	readDir('plugins', {
		dir: BaseDirectory.AppData,
	}).then(
		(result) =>
		Promise.all(
			result.filter((fileInfo)=>fileInfo?.name !== undefined).map((fileInfo)=>loadPlugin(fileInfo.name as string))
		)
	)
	




export let addElement = (id: string, constructor: ComponentType<SvelteComponentTyped>, definition: WidgetDefinition) => {
    widgetDefinitions[id] = Object.assign(constructor, {config: definition});
}
