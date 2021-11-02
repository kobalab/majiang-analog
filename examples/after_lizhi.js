/*
 *  先制リーチを受けた局の結果と収支
 */
"use strict";

class AnaLog extends require('../').base {

    init() {
        this._result = {
            n_game:      0,
            n_ju:        0,
            n:           0,
            sum:         0,
            n_hule:      0,
            sum_hule:    0,
            n_beizimo:   0,
            sum_beizimo: 0,
            n_beirong:   0,
            sum_beirong: 0,
            n_qita:      0,
            sum_qita:    0,
            n_pingju:    0,
            sum_pingju:  0
        };
    }
    kaiju(paipu) {
        this._result.n_game++;
        this._qijia = paipu.qijia;
    }
    qipai(qipai) {
        this._menfeng  = (8 + this.viewpoint - this._qijia - qipai.jushu) % 4;
        this._beilizhi = false;
        this._lizhi    = [0,0,0,0];
        this._result.n_ju++;
    }
    zimo(zimo)   { this._lizhi = this._lizhi.map(x=> x && 1) }
    fulou(fulou) { this._lizhi = this._lizhi.map(x=> x && 1) }
    dapai(dapai) {
        if (dapai.p.substr(-1) == '*') {
            this._lizhi[dapai.l] = -1;
            if (this._lizhi[this._menfeng]) return;
            this._beilizhi = true;
        }
    }
    last(log) {
        if (! this._beilizhi) return;
        let r = this._result;
        let lizhibang = this._lizhi[this._menfeng] == 1 ? 1000 : 0;
        let last = log.filter(d=> d.pingju||d.hule);
        if (last[0].pingju) {
            r.n_pingju   ++;
            r.sum_pingju += last[0].pingju.fenpei[this._menfeng] - lizhibang;
        }
        else if (last[0].hule.l == this._menfeng) {
            r.n_hule   ++;
            r.sum_hule += last[0].hule.fenpei[this._menfeng] - lizhibang;
        }
        else if (last[1] && last[1].hule.l == this._menfeng) {
            r.n_hule   ++;
            r.sum_hule += last[1].hule.fenpei[this._menfeng] - lizhibang;
        }
        else if (last[0].hule.baojia == null) {
            r.n_beizimo   ++;
            r.sum_beizimo += last[0].hule.fenpei[this._menfeng] - lizhibang;
        }
        else if (last[0].hule.baojia == this._menfeng) {
            r.n_beirong   ++;
            r.sum_beirong += last[0].hule.fenpei[this._menfeng] - lizhibang;
            if (last[1]) r.sum_beirong += last[1].hule.fenpei[this._menfeng];
        }
        else {
            r.n_qita   ++;
            r.sum_qita += last[0].hule.fenpei[this._menfeng] - lizhibang;
            if (last[1]) r.sum_qita += last[1].hule.fenpei[this._menfeng];
        }
        r.n   ++;
        r.sum += last.map(d=> d.hule ? d.hule.fenpei[this._menfeng]
                                     : d.pingju.fenpei[this._menfeng])
                     .reduce((x,y)=> x + y) - lizhibang;
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>')
    .option('times',     { alias: 't' })
    .option('viewpoint', { alias: 'v', default: 0 })
    .option('player',    { alias: 'p' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._[0];

let r = AnaLog.analyze(filename, argv)._result;

if (! argv.silent) console.log(r);

console.log('被先制リーチ率',
            Math.round(r.n        / r.n_ju * 1000) / 10 + '%');
console.log('和了',
            Math.round(r.n_hule      / r.n * 1000) / 10 + '%',
            Math.round(r.sum_hule    / r.n_hule));
console.log('放銃',
            Math.round(r.n_beirong   / r.n * 1000) / 10 + '%',
            Math.round(r.sum_beirong / r.n_beirong));
console.log('被ツモ',
            Math.round(r.n_beizimo   / r.n * 1000) / 10 + '%',
            Math.round(r.sum_beizimo / r.n_beizimo));
console.log('横移動',
            Math.round(r.n_qita      / r.n * 1000) / 10 + '%',
            Math.round(r.sum_qita    / r.n_qita));
console.log('流局',
            Math.round(r.n_pingju    / r.n * 1000) / 10 + '%',
            Math.round(r.sum_pingju  / r.n_pingju));
console.log('平均', Math.round(r.sum / r.n));
