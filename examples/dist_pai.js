/*
 *  局終了時の牌の分布
 */
"use strict";

function init_dist(n, hongpai = {m:0,p:0,s:0}) {
    return {
        m: [hongpai.m, n,n,n,n,n,n,n,n,n],
        p: [hongpai.p, n,n,n,n,n,n,n,n,n],
        s: [hongpai.s, n,n,n,n,n,n,n,n,n],
        z: [     null, n,n,n,n,n,n,n],
    };
}

class AnaLog extends require('../') {

    init() {
        this._result = {
            shoupai: init_dist(0),
            fulou:   init_dist(0),
            he:      init_dist(0),
            shan:    init_dist(0),
        };
    }
    last(log) {
        let r = this._result;
        let shan = init_dist(4, {m:1,p:1,s:1});
        for (let l = 0; l < 4; l++) {
            for (let s of ['m','p','s','z']) {
                let bingpai = this.board.shoupai[l]._bingpai[s];
                for (let n = 0; n < bingpai.length; n++) {
                    r.shoupai[s][n] += bingpai[n];
                    shan[s][n]      -= bingpai[n];
                }
            }
            for (let m of this.board.shoupai[l]._fulou) {
                let s = m[0];
                for (let n of m.match(/\d/g)) {
                    r.fulou[s][n]++;
                    shan[s][n]--;
                    if (n == 0) {
                        r.fulou[s][5]++;
                        shan[s][5]--;
                    }
                }
            }
            for (let p of this.board.he[l]._pai) {
                if (p.match(/[\+\=\-]$/)) continue;
                let s = p[0];
                let n = p[1];
                r.he[s][n]++;
                shan[s][n]--;
                if (n == 0) {
                    r.he[s][5]++;
                    shan[s][5]--;
                }
            }
        }
        for (let s of ['m','p','s','z']) {
            for (let n = 0; n < shan[s].length; n++) {
                if (s == 'z' && n == 0) continue;
                r.shan[s][n] += shan[s][n];
            }
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
