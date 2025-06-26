/*
 *  局終了時の牌の分布(手牌と河に分類)
 */
"use strict";

function dist() {
    return {
        m: [0,0,0,0,0,0,0,0,0,0],
        p: [0,0,0,0,0,0,0,0,0,0],
        s: [0,0,0,0,0,0,0,0,0,0],
        z: [0,0,0,0,0,0,0,0]
    };
}

class AnaLog extends require('../') {

    init() {
        this._result = {
            shoupai: dist(),
            he:      dist()
        };
    }
    last(log) {
        let r = this._result;
        for (let l = 0; l < 4; l++) {
            let shoupai = this.board.shoupai[l].toString();
            for (let suitstr of shoupai.match(/[mpsz][\d\+\=\-]+/g)||[]) {
                let s = suitstr[0];
                for (let n of suitstr.match(/\d(?![\+\=\-])/g)) {
                    r.shoupai[s][n]++;
                    if (n == 0) r.shoupai[s][5]++;
                }
            }
            for (let p of this.board.he[l]._pai) {
                r.he[p[0]][p[1]]++;
                if (p[1] == 0) r.he[p[0]][5]++;
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

let rv = AnaLog.analyze(filename, argv)._result;
for (let n = 0; n <= 9; n++) {
    let shoupai = rv.shoupai.m[n] + rv.shoupai.p[n] + rv.shoupai.s[n];
    let he      = rv.he.m[n]      + rv.he.p[n]      + rv.he.s[n];
    console.log(n, shoupai / (shoupai + he));
}
let shoupai = 0, he = 0;
for (let n = 1; n <= 7; n++) {
    shoupai += rv.shoupai.z[n];
    he      += rv.he.z[n];
}
console.log('z', shoupai / (shoupai + he));
