/*
 *  巡目ごとの向聴数・立直率・和了率
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

class AnaLog extends require('../') {

    init() {
        this._result = {
            xiangting:  [],
            lizhi:      [],
            hule:       [],
        };
    }
    qipai(qipai) {
        let r = this._result;
        if (! r.xiangting[0]) {
            r.xiangting[0] = [0,0,0,0,0,0,0];
            r.lizhi[0]     = 0;
            r.hule[0]      = 0;
        }
        for (let l = 0; l < 4; l++) {
            let x = Majiang.Util.xiangting(this.board.shoupai[l]);
            r.xiangting[0][x]++;
        }
    }
    dapai(dapai) {
        let r = this._result;
        let n = this.board.he[dapai.l]._pai.length;
        if (! r.xiangting[n]) {
            r.xiangting[n] = [0,0,0,0,0,0,0];
            r.lizhi[n]     = 0;
            r.hule[n]      = 0;
        }
        let x = Majiang.Util.xiangting(this.board.shoupai[dapai.l]);
        r.xiangting[n][x]++;
        if (dapai.p.substr(-1) == '*') r.lizhi[n]++;
    }
    hule(hule) {
        let r = this._result;
        let n = this.board.he[hule.l]._pai.length;
        r.hule[n]++;
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

console.log(AnaLog.analyze(filename, argv)._result);
