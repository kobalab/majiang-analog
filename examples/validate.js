/*
 *  牌譜の正当性チェック
 */
"use strict";

class AnaLog extends require('../') {

    log(log) {
        try {
            super.log(log);
        }
        catch(e) {
            console.log(this.idx());
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>')
    .option('times',     { alias: 't' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._[0];

AnaLog.analyze(filename, argv);
