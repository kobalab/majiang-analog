/*
 *  ダブルリーチの好形率・和了率・平均打点
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

class AnaLog extends require('../') {

    init() {
        this._result = {
            '好形': { lizhi: 0, hule: 0, defen: 0 },
            '愚形': { lizhi: 0, hule: 0, defen: 0 },
        };
    }
    qipai(qipai) {
        this._game = { lizhi: [], diyizimo: true };
    }
    dapai(dapai) {
        if (! this._game.diyizimo) return;
        if (dapai.p.substr(-1) == '*') {
            let shoupai = this.board.shoupai[dapai.l];
            let n_tingpai = Majiang.Util.tingpai(shoupai)
                                .map(p => 4 - shoupai._bingpai[p[0]][p[1]])
                                .reduce((x, y)=> x + y, 0);
            let form = n_tingpai >= 6 ? '好形' : '愚形';
            this._game.lizhi[dapai.l] = form;
            this._result[form].lizhi++;
        }
        if (dapai.l == 3) this._game.diyizimo = false;
    }
    fulou(fulou) {
        this._game.diyizimo = false;
    }
    gang(gang) {
        this._game.diyizimo = false;
    }
    hule(hule) {
        let form = this._game.lizhi[hule.l];
        if (form) {
            this._result[form].hule++;
            this._result[form].defen += hule.defen;
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

console.log(AnaLog.analyze(filename, argv)._result);
