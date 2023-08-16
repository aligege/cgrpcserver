import { ISocketServer } from "cgserver"
import { GCgMqCfg } from "./Config/CgMqConfig"
import { CgMqClientWebSocket } from "./Net/CgMqClientWebSocket"

export let GCgMqServer:CgMqServer = null
export class CgMqServer extends ISocketServer
{
    get allClients()
    {
        return this._ws_clients
    }
    constructor()
    {
        GCgMqCfg.init()
        super(GCgMqCfg)
        GCgMqServer = this
        this.registerWebSocketHandleClass("default",CgMqClientWebSocket)
    }
    onListenning()
    {
        super.onListenning()
    }
}