/*
 *  2つの牌譜から厳密に差分を抽出する
 */
"use strict";

const assert = require('assert');
const getlogs = require('../').getlogs;

function diff(p1, p2) {
    let log1 = p1.paipu.log, log2 = p2.paipu.log;
    let qijia = p1.paipu.qijia;
    for (let i = 0; i < Math.min(log1.length, log2.length); i++) {
        let jushu = log1[i][0].qipai.jushu;
        for (let j = 0; j < Math.min(log1[i].length, log2[i].length); j++) {
            try {
                assert.deepEqual(log1[i][j], log2[i][j]);
            }
            catch(e) {
                let t = Object.keys(log1[i][j])[0];
                let v = log2[i][j][t] && log1[i][j][t].l != null
                            && log1[i][j][t].l == log2[i][j][t].l
                                ? (qijia + jushu + log1[i][j][t].l) % 4 : '';
                console.log(
                    `${p1.basename}/${v}/${i}/${j}`,
                    `${p2.basename}/${v}/${i}/${j}`
                );
                console.log(log1[i][j]);
                console.log(log2[i][j]);
                if (! argv.all) process.exit(1);
            }
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir1> <log-dir2>')
    .option('recursive', { alias: 'r', boolean: true })
    .option('all', {alias: 'a', boolean: true, description:'差分を全て抽出する'})
    .demandCommand(2)
    .argv;
const logs1 = getlogs(argv._[0], argv.recursive);
const logs2 = getlogs(argv._[1], argv.recursive);

let t = 0;
for (let p1 of logs1) {
    let p2 = logs2.next().value;
    if (! p2) break;
    diff(p1, p2);
    t++;
    if (argv.times && t >= argv.times) return;
}
