﻿import { ISocketServer } from "cgserver"
import { CgRpcClientWebSocket } from "./Net/CgRpcClientWebSocket"
import { GCgRpcCfg } from "./Config/CgRpcConfig"

export let GCgRpcServer:CgRpcServer = null
export class CgRpcServer extends ISocketServer
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
        this.registerWebSocketHandleClass("default",CgRpcClientWebSocket)
    }
    onListenning()
    {
        super.onListenning()
    }
}