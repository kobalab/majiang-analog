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
            if (! this._result.n_rank) this._result.n_rank = [ 0, 0, 0, 0 ];
            this._result.n_rank[paipu.rank[this._viewpoint] - 1]++;
            if (! this._result.sum_point) this._result.sum_point = 0;
            this._result.sum_point += + paipu.point[this._viewpoint];
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

const r = AnaLog.analyze(filename, argv)._result;

if (argv.player) {

    function round(n, r) {
        n = '' + n;
        if (! n.match(/\./)) return n;
        if (r == 0) return n.replace(/\..*$/,'');
        for (let i = 0; i < r; i++) { n += '0' }
        const regex = new RegExp(`(\\\.\\d{${r}}).*$`);
        return n.replace(/^0\./,'.').replace(regex, '$1');
    }

    if (! argv.silent) console.log(r);

    console.log(argv.player);
    console.log('対局数: ' + r.n_game + ' (' + r.n_rank.join(' + ') + ')');
    console.log(
        '平均順位: '   + round([1,2,3,4].map(x=>r.n_rank[x-1]*x)
                                      .reduce((x,y)=>x + y)
                                / r.n_game, 2) + '、'
        + 'トップ率: ' + round(r.n_rank[0] / r.n_game, 3) + '、'
        + '連対率: '   + round((r.n_rank[0] + r.n_rank[1]) / r.n_game, 3) + '、'
        + 'ラス率: '   + round(r.n_rank[3] / r.n_game, 3)
    );
    console.log(
          '和了率: '   + round(r.n_hule / r.n_ju, 3) + '、'
        + '放銃率: '   + round(r.n_bao / r.n_ju, 3) + '、'
        + '立直率: '   + round(r.n_lizhi / r.n_ju, 3) + '、'
        + '副露率: '   + round(r.n_fulou / r.n_ju, 3) + '、'
        + '平均打点: ' + round(r.sum_defen / r.n_hule, 0)
    );
}
else if (argv.viewpoint != null) {

    console.log(
        '========',
        r.n_game,
        r.n_ju,
        r.n_rank.map(n => Math.round(n / r.n_game * 1000) / 1000),
        Math.round((r.n_rank[0]*1 + r.n_rank[1]*2
                    + r.n_rank[2]*3 + r.n_rank[3]*4)
                                                / r.n_game * 100) /100,
        Math.round(r.sum_point / r.n_game * 10) / 10,
        '==',
        Math.round(r.n_hule    / r.n_ju * 1000) / 1000,
        Math.round(r.n_bao     / r.n_ju * 1000) / 1000,
        Math.round(r.n_lizhi   / r.n_ju * 1000) / 1000,
        Math.round(r.n_fulou   / r.n_ju * 1000) / 1000,
        Math.round(r.sum_defen / r.n_hule),
        '==',
        r.n_hule, r.hule,
        '==',
        r.n_pingju,
        Math.round(r.n_pingju / r.n_ju * 1000) / 1000,
        r.pingju
    );
}
else {
    console.log(r);
}
