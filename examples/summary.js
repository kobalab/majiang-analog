/*
 *  基礎情報と和了役・流局理由集計
 */
"use strict";

class AnaLog extends require('../').base {

    init() {
        this._result = {
            n_game:     0,
            n_ju:       0,
            n_hule:     0,
            n_pingju:   0,
            n_bao:      0,
            n_lizhi:    0,
            n_fulou:    0,
            sum_defen:  0,
            hule:       {},
            pingju:     {},
        };
    }
    kaiju(paipu) {
        this._result.n_game++;
        if (this._viewpoint != null) {
            if (! this._result.rank) this._result.rank = [ 0, 0, 0, 0 ];
            this._result.rank[paipu.rank[this._viewpoint] - 1]++;
            if (! this._result.point) this._result.point = 0;
            this._result.point += + paipu.point[this._viewpoint];
        }
    }
    qipai(qipai) {
        this._result.n_ju++;
        this._fulou = [0,0,0,0];
    }
    dapai(dapai) {
        if (! this.viewpoint(dapai.l)) return;
        if (dapai.p.substr(-1) == '*') this._result.n_lizhi++;
    }
    fulou(fulou) {
        if (! this.viewpoint(fulou.l)) return;
        this._fulou[fulou.l] = 1;
    }
    hule(hule) {
        if (! this.viewpoint(hule.l)) return;
        this._result.n_hule++;
        this._result.sum_defen += hule.defen;
        for (let hupai of hule.hupai) {
            let name = hupai.name.match(/^(?:場風|自風|翻牌|役牌)/)
                            ? '翻牌' : hupai.name;
            this._result.hule[name] = this._result.hule[name] || 0;
            this._result.hule[name] += name.match(/^(?:赤|裏)?ドラ$/)
                                            ? hupai.fanshu : 1;
        }
    }
    pingju(pingju) {
        this._result.n_pingju++;
        this._result.pingju[pingju.name] = this._result.pingju[pingju.name] || 0;
        this._result.pingju[pingju.name]++;
    }
    last(log) {
        this._result.n_fulou += this._fulou.reduce((x,y)=> x + y);
        const last = log[log.length - 1];
        if (! last.hule || ! this.viewpoint(last.hule.baojia)) return;
        if (last.hule && last.hule.baojia != null) this._result.n_bao++;
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>')
    .option('times',     { alias: 't' })
    .option('viewpoint', { alias: 'v' })
    .option('player',    { alias: 'p' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._[0];

console.log(AnaLog.analyze(filename, argv)._result);
