﻿import { GCgRpcCfg } from "./Config/CgRpcConfig"
import { cg } from "cgserver"

export let GCgRpcServer:CgRpcServer = null
export class CgRpcServer extends cg.IWebSocketServer
{
    get allClients()
    {
        return this._ws_clients
    }
    constructor(port:number)
    {
        GCgRpcCfg.init()
        GCgRpcCfg.port = port
        super(GCgRpcCfg)
        GCgRpcServer = this
        this.registerWebSocketHandleClass("default",cg.IRpcClientWebSocket)
    }
    onListenning()
    {
        super.onListenning()
    }
}