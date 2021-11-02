/*
 *  和了役と流局理由の検索
 */
"use strict";

class AnaLog extends require('../').base {

    hule(hule) {
        if (! this.watch(hule.l)) return;
        if (hule.hupai.find(h=> h.name == search))
                                    console.log(this.idx(hule.l));
    }
    pingju(pingju) {
        if (pingju.name == search)  console.log(this.idx());
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir> <search>')
    .option('times',     { alias: 't' })
    .option('viewpoint', { alias: 'v' })
    .option('player',    { alias: 'p' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(2)
    .argv;
const filename = argv._[0];
const search   = argv._[1];

AnaLog.analyze(filename, argv);
