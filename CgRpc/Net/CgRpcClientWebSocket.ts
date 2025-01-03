import _ from 'underscore';
import { GCgRpcServer } from '../CgRpcServer';
import { RpcMsg } from 'cgserver/dist/types/Framework/SocketServer/IRpc';
import { cg } from 'cgserver';

/*
    主动和center服连接，交换比赛信息，游戏的最核心玩法
*/
export class CgRpcClientWebSocket extends cg.IRpcClientWebSocket
{
    isListenning(listen:string)
    {
        if(!listen)
        {
            return true
        }
        return !!this._listens[listen]
    }
    constructor(server:cg.ISocketServer)
    {
        super(server)
        this._debug_msg=true
        this._group="cgrpc"
        this._id=cg.global.gCgServer.customprocessid
    }
    getWsByGroup(group:string,listen:string)
    {
        let wses:CgRpcClientWebSocket[]=[]
        if(!group)
        {
            return wses
        }
        let allClients = GCgRpcServer.allClients
        for(let key in allClients)
        {
            let ct = allClients[key] as CgRpcClientWebSocket
            if(ct._group==group&&ct.isListenning(listen))
            {
                wses.push(ct)
            }
        }
        return wses
    }
    getWsByGroupId(group:string,id:string)
    {
        if(!group)
        {
            return null
        }
        let allClients = GCgRpcServer.allClients
        for(let key in allClients)
        {
            let ct = allClients[key] as CgRpcClientWebSocket
            if(ct._group==group&&ct._id==id)
            {
                return ct
            }
        }
        return null
    }
    async receive_msg(req_msg:RpcMsg)
    {
        if(!req_msg.__rpcid)
        {
            let retMsg = this.getNewMsg("msg",{id:10001,des:"非法rpc消息"})
            this.send(retMsg)
            return
        }
        if(!req_msg.to_group)
        {
            let ret_msg = this.toRetMsg(req_msg,req_msg.data,{id:10002,des:"消息中必须附带接受方的身份to_group"})
            this.send(ret_msg)
            return
        }
        let wses:CgRpcClientWebSocket[]=[]
        if(req_msg.to_id)
        {
            let ws = this.getWsByGroupId(req_msg.to_group,req_msg.to_id)
            wses.push(ws)
        }
        else
        {
            wses = this.getWsByGroup(req_msg.to_group,req_msg.listen)
        }
        //发送给远程服务器的消息
        if(wses.length==0)
        {
            req_msg.errcode={id:10004,des:"一个接收者都没找到"}
            this.send(req_msg)
            return
        }
        let arets=[]
        let rpc_id=req_msg.__rpcid
        let rpc_id_index=0
        for(let key in wses)
        {
            let ws = wses[key]
            req_msg.__rpcid=rpc_id+"_"+rpc_id_index
            rpc_id_index++
            let ret = ws.callRemote(req_msg)
            arets.push(ret)
        }
        let rets=[]
        let first_ret:RpcMsg=null
        for(let key in arets)
        {
            let ret=await arets[key]
            rets.push(ret.data)
            if(!first_ret)
            {
                first_ret=ret
            }
        }
        //还原rpc_id
        req_msg.__rpcid=rpc_id
        //回复给调用来源的服务器
        let retMsg = this.toRetMsg(req_msg,rets)
        if(first_ret)
        {
            retMsg.from_group=req_msg.to_group
            retMsg.to_group=req_msg.from_group
            if(req_msg.to_id)
            {
                retMsg.from_id=first_ret.from_id
            }
            else
            {
                retMsg.from_id=""
            }
        }
        this.send(retMsg)
    }
}