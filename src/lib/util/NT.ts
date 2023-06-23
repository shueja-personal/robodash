
import { NetworkTables, NetworkTablesTopic, NetworkTablesTypeInfos, type AnnounceMessageParams, type NetworkTablesTypeInfo } from 'ntcore-ts-client';
import { writable, type Writable, get as getStore} from 'svelte/store';
import { onDestroy } from 'svelte';

export type NTStore<T extends NetworkTablesTypes> = {
    subscribe: (
        (cb: (arg0:T)=>void) => (()=>void))
    set: (_: T)=> void,
    get: ()=>T,
    clearTopic: ()=>void,
    setTopic: (arg0: string)=>void,
    update: (fn:(arg0:T) => T)=>void,
    type: ()=> NetworkTablesTypeInfo,
    key: ()=>string
}
export type NetworkTablesTypes = string | number | boolean | ArrayBuffer | boolean[] | string[] | number[]
export type NTStoreTypes = NTStore<string> | NTStore<number> | NTStore<boolean> | NTStore<ArrayBuffer> 
    | NTStore<boolean[]> | NTStore<string[]> | NTStore<number[]>
class NT {
    ip: string;
    nt: NetworkTables

    constructor(ip: string) {
        this.ip = ip;

        this.nt  = NetworkTables.getInstanceByURI(ip);

        this.nt.client.messenger.subscribe({
            options: {
    topicsonly: true, prefix:true
            },
            topics: [''],
            subuid: 1
        })
        let removeListener = this.nt.addRobotConnectionListener((connected)=>{
            if (connected) {
                this.topics.set([...this.getTopics().values()])}
                this.keys.set([...this.getTopics().keys()])
                console.log(this.nt.client['topics'])
            }
                
        )
        window.addEventListener("beforeunload", ()=>removeListener())
        
    }
    topics: Writable<AnnounceMessageParams[]> = writable([])
    keys: Writable<string[]> = writable([])

    
    getTopics () {
        return this.nt.client.getAllAnnouncedTopics()
    }
    getTopicArray() {
        return [...this.getTopics()]
    }
    setIP(ip: string) {
        if(this.ip !== ip) {
            this.nt.changeURI(ip);
        }
        this.ip = ip;        
    }
    NTValue<T extends NetworkTablesTypes>(init:T,  topicType : NetworkTablesTypeInfo, key?:string) : NTStore<T> {
        let createdWithKey = key !== undefined
        let _val = init;
        let needsToPublish = true;
        const subs: Array<(_:T)=>void>= [];
        let hasTopic = createdWithKey;
        let topic : NetworkTablesTopic<T>;
        let subuuid = 0;
        let topicKey : string = key ?? "";
        console.log (`Creating ${topicType} topic: ${init}, ${key}`)
        const callback = (value : T | null)=>{
            if (value === null || value === undefined) {
                return;
            }
                _val = value;
                subs.forEach((fn) => fn(_val));
            }

        if (key !== undefined) {
            hasTopic = true;
            topic = this.nt.createTopic<T>(key, topicType);
            
            subuuid = topic.subscribe(callback, true)
        }



        
        const subscribe = (cb: ((arg:T)=>void)) => {
            subs.push(cb);
            cb(_val);
        
            return () => {
                const index = subs.findIndex((fn) => fn === cb);
                subs.splice(index, 1);
            };
        };
        
        const set = (v: T) => {
            if (hasTopic) {
                if (needsToPublish) {
                    topic.publish();
                    needsToPublish = false;
                }
                topic.setValue(v);
            }

            _val = v;
            subs.forEach((fn) => fn(_val));
        };

        const get = () => {
            return _val;
        }

        const clearTopic = () => {
            if(hasTopic) {
                topic.unsubscribe(subuuid);
                hasTopic = false;
            }
        }
        const setTopic = (key: string) => {

            console.log("setting topic for ", key)
            clearTopic();
            topicKey = key;
            topic = this.nt.createTopic(key, topicType, _val);
            topic.announce(this.getTopics().get(key)?.id)
            // if (getStore(this.keys).includes(key)) {
            //     topic.unannounce()
            // }
            hasTopic = true;
            subuuid = topic.subscribe(callback, true);
        }
        
        const update = (fn: (_:T) => T) => set(fn(_val));
        const type = () => topicType;

        // We create our store as a function so that it can be passed as a callback where the value to set is the first parameter
        function store(val: T) {set(val)}
        store.subscribe = subscribe;
        store.set = set;
        store.get = get;
        store.update = update;
        store.type = type;
        store.setTopic = setTopic;
        store.clearTopic = clearTopic;
        store.key = ()=> topicKey;
        return store;
    }

    NTInt         (init:number,    key?:string){return this.NTValue<number>    (init, NetworkTablesTypeInfos.kInteger,      key) }
    NTDouble      (init:number,    key?:string){return this.NTValue<number>    (init, NetworkTablesTypeInfos.kDouble,       key) }
    NTBoolean     (init:boolean,   key?:string){return this.NTValue<boolean>   (init, NetworkTablesTypeInfos.kBoolean,      key) }
    NTString      (init:string,    key?:string){return this.NTValue<string>    (init, NetworkTablesTypeInfos.kString,       key) }
    NTIntArray    (init:number[],  key?:string){return this.NTValue<number[]>  (init, NetworkTablesTypeInfos.kIntegerArray, key) }
    NTDoubleArray (init:number[],  key?:string){return this.NTValue<number[]>  (init, NetworkTablesTypeInfos.kDoubleArray,  key) }
    NTBooleanArray(init:boolean[], key?:string){return this.NTValue<boolean[]> (init, NetworkTablesTypeInfos.kBooleanArray, key) }
    NTStringArray (init:string[],  key?:string){return this.NTValue<string[]>  (init, NetworkTablesTypeInfos.kStringArray,  key) }
    
}




export default new NT("127.0.0.1");