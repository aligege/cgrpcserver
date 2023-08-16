import { IRpcClientWebSocket, ISocketServer, RpcBaseMsg } from 'cgserver';
import _ from 'underscore';
import { GCgMqServer } from '../CgMqServer';
export class CgMqMsg extends RpcBaseMsg
{
    /**
     * 必填,固定msg
     */
    cmd="msg"
    /**
     * 必填，目的身份
     */
    to_identity=""
    /**
     * 消息携带的数据
     */
    data:any=null
}
export class CgMqRetMsg extends CgMqMsg
{
     /**
      * 发送者身份
      */
     from_identity=""
     /**
      * audience 数量
      */
     count=0
}
/*
    主动和center服连接，交换比赛信息，游戏的最核心玩法
*/
export class CgMqClientWebSocket extends IRpcClientWebSocket
{
    /**
     * 这个identity是用来表明这个客户端的身份的
     * 不需要唯一
     */
    protected _identity=""
    get identity()
    {
        return this._identity
    }
    constructor(server:ISocketServer)
    {
        super(server)
        this._debug_msg=true
    }
    getWsByIdentity(identity:string)
    {
        let wses:CgMqClientWebSocket[]=[]
        if(!identity)
        {
            return wses
        }
        let allClients = GCgMqServer.allClients
        for(let key in allClients)
        {
            let ct = allClients[key] as CgMqClientWebSocket
            if(ct.identity==identity)
            {
                wses.push(ct)
            }
        }
        return wses
    }
    receive_init(msg:CgMqRetMsg|any)
    {
        if(msg.__rpcid)
        {
            msg.__return=true
        }
        let identity=msg.identity||""
        if(!identity)
        {
            let retMsg = msg as CgMqRetMsg
            this.extendRetMsg(retMsg,{id:10004,des:"初始化消息必须带有identity"})
            this.send(retMsg)
            return
        }
        this._identity=identity
        let retMsg = msg as CgMqRetMsg
        this.extendRetMsg(retMsg)
        this.send(retMsg)
    }
    async receive_msg(jsonData)
    {
        let msg:CgMqMsg = jsonData
        if(!msg)
        {
            let retMsg = this.getNewMsg("msg",{id:10001,des:"消息不能为空"})
            this.send(retMsg)
            return
        }
        if(!msg.to_identity)
        {
            let retMsg = msg as CgMqRetMsg
            this.extendRetMsg(retMsg,{id:10002,des:"消息中必须附带接受方的身份to_identity"})
            this.send(retMsg)
            return
        }
        let wses = this.getWsByIdentity(msg.to_identity)
        let toMsg = msg as CgMqRetMsg 
        toMsg.count=wses.length
        toMsg.from_identity=this._identity
        if(toMsg.count==0)
        {
            this.extendRetMsg(toMsg,{id:10004,des:"一个接收者都没找到"})
            this.send(toMsg)
            return
        }
        this.extendRetMsg(toMsg)
        let arets=[]
        for(let key in wses)
        {
            let ws = wses[key]
            //rpc消息
            if(toMsg.__rpcid)
            {
                let ret = ws.callRemote(toMsg)
                arets.push(ret)
            }
            //普通消息
            else
            {
                ws.send(toMsg)
            }
        }
        let rets=[]
        for(let key in arets)
        {
            let ret=await arets[key]
            rets.push(ret.data)
        }
        //rpc消息是需要回复的
        if(rets.length>0)
        {
            let retMsg = toMsg
            let from = retMsg.from_identity
            retMsg.from_identity=retMsg.to_identity
            retMsg.to_identity=from
            retMsg.__return=true
            retMsg.data=rets
            this.send(retMsg)
        }
        //普通转发消息无需回复
    }
}