/*
 *  リーチ宣言牌および最初に切った数牌と同種の牌の危険度
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

class AnaLog extends require('../') {

    init() {
        this._result = {
            first: [],      // 最初に打たれた数牌のまわり
            last:  [],      // リーチ宣言牌のまわり
        };
        for (let n = 0; n < 9; n++) {
            this._result.first[n] = [0,0,0,0,0,0,0,0,0,0];
            this._result.last[n]  = [0,0,0,0,0,0,0,0,0,0];
        }
    }
    qipai(qipai) {
        this._first = [];
    }
    dapai(dapai) {
        let s = dapai.p[0], n = +dapai.p[1]||5;
        if (! this._first[dapai.l] && s != 'z') this._first[dapai.l] = s+n;
        let r = this._result;
        if (dapai.p.substr(-1) == '*') {
            let tingpai = Majiang.Util.tingpai(this.board.shoupai[dapai.l]);
            /* リーチ宣言牌まわりの集計 */
            if (s != 'z') {
                r.last[n-1][0]++;
                for (let i = 1; i <=9; i++) {
                    if (tingpai.find(p=> p == s+i)) r.last[n-1][i]++;
                }
            }
            /* 最初に打たれた数牌まわりの集計 */
            if (this._first[dapai.l]) {
                let s = this._first[dapai.l][0], n = +this._first[dapai.l][1];
                r.first[n-1][0]++
                for (let i = 1; i <=9; i++) {
                    if (tingpai.find(p=> p == s+i)) r.first[n-1][i]++;
                }
            }
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>...')
    .option('times',     { alias: 't' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._;

console.log(AnaLog.analyze(filename, argv)._result);
