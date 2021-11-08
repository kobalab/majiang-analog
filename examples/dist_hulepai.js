/*
 *  和了牌の分布
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

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
            n_lizhi:     0,
            lizhi:       init_dist(0),
            n_not_lizhi: 0,
            not_lizhi:   init_dist(0),
        };
    }
    dapai(dapai) {
        let r = this._result;
        if (dapai.p.substr(-1) == '*') {
            r.n_lizhi++;
            let shoupai = this.board.shoupai[dapai.l];
            for (let p of Majiang.Util.tingpai(shoupai)) {
                let s = p[0];
                let n = p[1];
                r.lizhi[s][n]++;
            }
        }
    }
    hule(hule) {
        let r = this._result;
        let shoupai = this.board.shoupai[hule.l];
        if (! shoupai.lizhi) {
            r.n_not_lizhi++;
            let dapai = shoupai.get_dapai();
            if (dapai) shoupai.dapai(dapai.pop());
            for (let p of Majiang.Util.tingpai(shoupai)) {
                let s = p[0];
                let n = p[1];
                r.not_lizhi[s][n]++;
            }
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

console.log(AnaLog.analyze(filename, argv)._result);
