/*!@preserve
* CgRpc     : one simple rpcserver
* Copyright : trojan <chengang01@live.com>
*/

import { CgRpcServer } from "./CgRpc/CgRpcServer"

for(let i=0;i<process.argv.length;++i)
{
    let str = process.argv[i].toLowerCase()
}

let server = new CgRpcServer()
server.run()