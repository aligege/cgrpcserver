/*!@preserve
* CgMq     : one simple mq
* Copyright : trojan <chengang01@live.com>
*/

import { CgMqServer } from "../CgMq/CgMqServer"

for(let i=0;i<process.argv.length;++i)
{
    let str = process.argv[i].toLowerCase()
}

let server = new CgMqServer()
server.run()