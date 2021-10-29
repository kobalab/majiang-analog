/*
 * base
 */
"use strict";

const getlogs = require('./getlogs');

module.exports = class AnaLogBase {

    constructor() {
        this._result = {};
    }

    analyze(basename, paipu, player_id) {

        this._basename  = basename;
        this._player_id = player_id;
        this._qijia     = paipu.qijia;
        this._n_ju      = 0;

        for (let log of paipu.log) {
            this.log(log);
        }
    }

    log(log) {

        let qipai   = log[0].qipai;
        this._jushu = qipai.zhuangfeng * 4 + qipai.jushu;

        for (let data of log) {
            if      (data.qipai)    this.qipai   (data.qipai);
            else if (data.zimo)     this.zimo    (data.zimo);
            else if (data.dapai)    this.dapai   (data.dapai);
            else if (data.fulou)    this.fulou   (data.fulou);
            else if (data.gang)     this.gang    (data.gang);
            else if (data.gangzimo) this.gangzimo(data.gangzimo);
            else if (data.kaigang)  this.kaigang (data.kaigang);
            else if (data.hule)     this.hule    (data.hule);
            else if (data.pingju)   this.pingju  (data.pingju);
        }

        this._n_ju++;
    }

    qipai(qipai) {}
    zimo(zimo)   {}
    dapai(dapai) {}
    fulou(fulou) {}
    gang(gang)   {}
    gangzimo(gangzimo) {}
    kaigang(kaigang)   {}
    hule(hule)         {}
    pingju(pingju)     {}

    idx(l) {
        let id = l != null               ? (this._qijia + this._jushu + l) % 4
               : this._player_id != null ? this._player_id
               :                     '';
        return `${this._basename}/${id}/${this._n_ju}`;
    }

    static analyze(filename, n_try) {

        const now = ()=> new Date().toLocaleTimeString();

        filename = filename || './';
        const analog = new this();

        let t = 0;
        console.log(`[${t}]`, now());

        for (let log of getlogs(filename)) {
            analog.analyze(log.basename, log.paipu);
            t++;
            if (n_try && t >= n_try) break;
            if (t % 10000 == 0) console.log(`[${t}]`, now());
        }

        console.log(`[${t}]`, now());
        return analog._result;
    }
}
