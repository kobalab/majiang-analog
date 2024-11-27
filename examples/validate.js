/*
 *  牌譜の正当性チェック
 */
"use strict";

class AnaLog extends require('../') {

    analyze(basename, paipu, viewpoint) {
        try {
            super.analyze(basename, paipu, viewpoint);
        }
        catch(e) {
            console.log(this.idx());
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>...')
    .option('recursive', { alias: 'r', boolean: true })
    .option('times',     { alias: 't' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._;

AnaLog.analyze(filename, argv);
