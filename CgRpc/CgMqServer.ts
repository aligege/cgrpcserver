import { ISocketServer } from "cgserver"
import { CgMqClientWebSocket } from "./Net/CgMqClientWebSocket"
import { GCgRpcCfg } from "./Config/CgRpcConfig"

export let GCgMqServer:CgMqServer = null
export class CgMqServer extends ISocketServer
{
    get allClients()
    {
        return this._ws_clients
    }
    constructor()
    {
        GCgRpcCfg.init()
        super(GCgRpcCfg)
        GCgMqServer = this
        this.registerWebSocketHandleClass("default",CgMqClientWebSocket)
    }
    onListenning()
    {
        super.onListenning()
    }
}