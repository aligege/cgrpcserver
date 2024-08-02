import { cg } from "cgserver";
import * as _ from "underscore";

export let GCgRpcCfg:RpcConfig=null
export class RpcConfig extends cg.IServerConfig
{
    constructor()
    {
        super("cgrpc")
        if(!cg.Config.rootDataDir.endsWith("/"))
        {
            cg.Config.rootDataDir+="/"
        }
    }
}
GCgRpcCfg = new RpcConfig()