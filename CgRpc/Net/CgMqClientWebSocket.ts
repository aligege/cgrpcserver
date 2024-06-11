import { GCgServer, IRpcClientWebSocket, ISocketServer, Rpc } from 'cgserver';
import _ from 'underscore';
import { GCgMqServer } from '../CgMqServer';
import { RpcMsg } from 'cgserver/dist/types/Framework/SocketServer/IRpc';

/*
    主动和center服连接，交换比赛信息，游戏的最核心玩法
*/
export class CgMqClientWebSocket extends IRpcClientWebSocket
{
    constructor(server:ISocketServer)
    {
        super(server)
        this._debug_msg=true
        this._group="cgrpc"
        this._id=GCgServer.customprocessid
    }
    getWsByGroup(group:string)
    {
        let wses:CgMqClientWebSocket[]=[]
        if(!group)
        {
            return wses
        }
        let allClients = GCgMqServer.allClients
        for(let key in allClients)
        {
            let ct = allClients[key] as CgMqClientWebSocket
            if(ct._group==group)
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
        let allClients = GCgMqServer.allClients
        for(let key in allClients)
        {
            let ct = allClients[key] as CgMqClientWebSocket
            if(ct._group==group&&ct._id==id)
            {
                return ct
            }
        }
        return null
    }
    receive_init(req_msg:RpcMsg)
    {
        if(req_msg.__rpcid)
        {
            req_msg.__return=true
        }
        if(!req_msg.from_group)
        {
            let ret_msg = this.toRetMsg(req_msg,req_msg.data,{id:10004,des:"初始化消息必须带有identity"})
            this.send(ret_msg)
            return
        }
        this._group=req_msg.from_group
        this._id=req_msg.from_id

        let ret_msg = this.toRetMsg(req_msg,null)
        this.send(ret_msg)
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
        let wses:CgMqClientWebSocket[]=[]
        if(req_msg.to_id)
        {
            let ws = this.getWsByGroupId(req_msg.to_group,req_msg.to_id)
            wses.push(ws)
        }
        else
        {
            wses = this.getWsByGroup(req_msg.to_group)
        }
        //发送给远程服务器的消息
        if(wses.length==0)
        {
            req_msg.errcode={id:10004,des:"一个接收者都没找到"}
            this.send(req_msg)
            return
        }
        let arets=[]
        for(let key in wses)
        {
            let ws = wses[key]
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
        //回复给调用来源的服务器
        let retMsg = this.toRetMsg(req_msg,rets)
        if(first_ret)
        {
            retMsg.from_group=first_ret.from_group
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