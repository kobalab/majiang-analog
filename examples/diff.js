/*
 *  2つの牌譜から差分を抽出する
 */
"use strict";

const assert = require('assert');
const getlogs = require('../').getlogs;

function find(log, zhuangfeng, jushu, idx1) {
    let idx2 = 0;
    for (let i = 0; i < log.length; i++) {
        let qipai = log[i][0].qipai;
        if (qipai.zhuangfeng == zhuangfeng && qipai.jushu == jushu) {
            if (idx1 == idx2) return i;
            idx2++;
        }
    }
}

function diff(p1, p2) {
    let zhuangfeng, jushu, idx;
    let rank = [p1.paipu.rank[argv.viewpoint], p2.paipu.rank[argv.viewpoint]];
    for (let i1 = 0; i1 < p1.paipu.log.length; i1++) {
        let qipai = p1.paipu.log[i1][0].qipai;
        if (qipai.zhuangfeng == zhuangfeng && qipai.jushu == jushu) idx ++;
        else                                                        idx = 0;
        zhuangfeng = qipai.zhuangfeng;
        jushu      = qipai.jushu;
        let i2 = find(p2.paipu.log, zhuangfeng, jushu, idx);
        if (i2 == null) continue;
        let menfeng = (8 + argv.viewpoint - p1.paipu.qijia - jushu) % 4;
        let fenpei;
        try {
            let log1 = p1.paipu.log[i1];
            let log2 = p2.paipu.log[i2];
            let last1 = log1[log1.length - 1];
            let last2 = log2[log2.length - 1];
            fenpei = [ (last1.hule||last1.pingju).fenpei[menfeng],
                       (last2.hule||last2.pingju).fenpei[menfeng] ];
            if (last1.hule) delete last1.hule.fenpei;
            if (last2.hule) delete last2.hule.fenpei;
            assert.deepEqual(last1, last2);
        }
        catch(e) {
            console.log(`${p1.basename}/${argv.viewpoint}/${i1}`,
                        `${p2.basename}/${argv.viewpoint}/${i2}`,
                        rank, fenpei);
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir1> <log-dir2>')
    .option('times',     { alias: 't' })
    .option('viewpoint', { alias: 'v', default: 0 })
    .demandCommand(2)
    .argv;
const logs1 = getlogs(argv._[0]);
const logs2 = getlogs(argv._[1]);

let t = 0;
for (let p1 of logs1) {
    let p2 = logs2.next().value;
    if (! p2) break;
    diff(p1, p2);
    t++;
    if (argv.times && t >= argv.times) return;
}
