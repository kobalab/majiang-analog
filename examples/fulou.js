/*
 *  巡目ごとの副露数・副露時向聴数
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

class AnaLog extends require('../') {

    init() {
        this._result = {
            fulou:     [],
            xiangting: [],
        };
    }
    fulou(fulou) {
        let r = this._result;
        let n = this.board.he[fulou.l]._pai.length;
        if (! r.fulou[n]) {
            r.fulou[n]     = [0,0,0,0];
            r.xiangting[n] = [0,0,0,0];
        }
        let shoupai = this.board.shoupai[fulou.l];
        let n_fulou = shoupai._fulou.filter(m=> m.match(/[\+\=\-]/)).length;
        r.fulou[n][n_fulou - 1]++;
        r.xiangting[n][n_fulou - 1] += Majiang.Util.xiangting(shoupai);
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

console.log(AnaLog.analyze(filename, argv)._result);
