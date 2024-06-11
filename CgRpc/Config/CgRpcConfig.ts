import { IServerConfig } from "cgserver";
import * as _ from "underscore";

export let GCgRpcCfg:RpcConfig=null
export class RpcConfig extends IServerConfig
{

}
GCgRpcCfg = new RpcConfig("cgrpc")