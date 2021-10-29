/*
 * base
 */
"use strict";

const getlogs = require('./getlogs');

module.exports = class AnaLogBase {

    constructor() {
        this._result = {};
    }

    analyze(basename, paipu, viewpoint) {

        this._basename  = basename;
        this._viewpoint = viewpoint;
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

    viewpoint(l) {
        return this._viewpoint == null ||
                    l != null
                &&  (this._qijia + this._jushu + l) % 4 == this._viewpoint;
    }

    idx(l) {
        let id = l != null               ? (this._qijia + this._jushu + l) % 4
               : this._viewpoint != null ? this._viewpoint
               :                     '';
        return `${this._basename}/${id}/${this._n_ju}`;
    }

    static analyze(filename = './', argv = {}) {

        const syslog = (t)=>{
            if (argv.silent) return;
            console.log(`[${t}]`, new Date().toLocaleTimeString());
        };

        let t = 0;

        const analog = new this();

        for (let log of getlogs(filename)) {
            if (t % 10000 == 0) syslog(t);
            analog.analyze(log.basename, log.paipu, argv.viewpoint);
            t++;
            if (argv.times && t >= argv.times) break;
        }

        syslog(t);
        return analog._result;
    }
}
