/*
 *  基礎情報と和了役・流局理由集計
 */
"use strict";

class AnaLog extends require('../').base {

    constructor() {
        super();
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
    analyze(basename, paipu, player_id) {
        super.analyze(basename, paipu, player_id);
        this._result.n_game++;
    }
    log(log) {
        this._fulou = [0,0,0,0];
        super.log(log);
        this._result.n_ju++;
        this._result.n_fulou += this._fulou.reduce((x,y)=> x + y);
        const last = log[log.length - 1];
        if (last.hule && last.hule.baojia != null) this._result.n_bao++;
    }
    dapai(dapai) {
        if (dapai.p.substr(-1) == '*') this._result.n_lizhi++;
    }
    fulou(fulou) {
        this._fulou[fulou.l] = 1;
    }
    hule(hule) {
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
}

let [ filename ] = process.argv.slice(2);

console.log(AnaLog.analyze(filename));
