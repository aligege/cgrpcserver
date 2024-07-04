#!/usr/bin/env node

/*!@preserve
* CgRpc     : one simple rpcserver
* Copyright : trojan <chengang01@live.com>
*/

import { CgRpcServer } from "./CgRpc/CgRpcServer";
import * as yargs from "yargs";

let port:number = yargs.argv.port || 8888

let server = new CgRpcServer(port)
server.run()

process.on('SIGINT', function () {
    console.log('Got a SIGINT');
    process.exit(0);
});