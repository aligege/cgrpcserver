import { IServerConfig } from "cgserver";
import * as _ from "underscore";

export let GCgMqCfg:CgMqConfigConfig=null
export class CgMqConfigConfig extends IServerConfig
{

}
GCgMqCfg = new CgMqConfigConfig("cgmq")