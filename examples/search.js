/*
 *  和了役と流局理由の検索
 */
"use strict";

class AnaLog extends require('../').base {

    hule(hule) {
        if (! this.watch(hule.l)) return;
        for (let hupai of hule.hupai) {
            if (hupai.name.match(search))
                                    console.log(this.idx(hule.l), hupai.name);
        }
    }
    pingju(pingju) {
        if (pingju.name.match(search)) console.log(this.idx(), pingju.name);
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <search> <log-dir>...')
    .option('recursive', { alias: 'r', boolean: true })
    .option('times',     { alias: 't' })
    .option('viewpoint', { alias: 'v' })
    .option('player',    { alias: 'p' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(2)
    .argv;
const search   = new RegExp(argv._.shift());
const filename = argv._;

AnaLog.analyze(filename, argv);
