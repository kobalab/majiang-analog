/*
 * base
 */
"use strict";

const getlogs = require('./getlogs');

module.exports = class AnaLogBase {

    constructor() { this.init() }

    analyze(basename, paipu, viewpoint) {

        this.basename  = basename;
        this.viewpoint = viewpoint;
        this.__qijia   = paipu.qijia;
        this.__n_ju    = 0;

        this.kaiju(paipu);

        for (let log of paipu.log) {
            this.log(log);
        }
    }

    log(log) {

        let qipai    = log[0].qipai;
        this.__jushu = qipai.zhuangfeng * 4 + qipai.jushu;

        for (let data of log) {
            if      (data.qipai)    this.__qipai   (data.qipai);
            else if (data.zimo)     this.__zimo    (data.zimo);
            else if (data.dapai)    this.__dapai   (data.dapai);
            else if (data.fulou)    this.__fulou   (data.fulou);
            else if (data.gang)     this.__gang    (data.gang);
            else if (data.gangzimo) this.__gangzimo(data.gangzimo);
            else if (data.kaigang)  this.__kaigang (data.kaigang);
            else if (data.hule)     this.__hule    (data.hule);
            else if (data.pingju)   this.__pingju  (data.pingju);
        }
        this.last(log);

        this.__n_ju++;
    }

    __qipai(qipai)       { this.qipai(qipai)       }
    __zimo(zimo)         { this.zimo(zimo)         }
    __dapai(dapai)       { this.dapai(dapai)       }
    __fulou(fulou)       { this.fulou(fulou)       }
    __gang(gang)         { this.gang(gang)         }
    __gangzimo(gangzimo) { this.gangzimo(gangzimo) }
    __kaigang(kaigang)   { this.kaigang(kaigang)   }
    __hule(hule)         { this.hule(hule)         }
    __pingju(pingju)     { this.pingju(pingju)     }

    init()             {}
    kaiju(paipu)       {}
    qipai(qipai)       {}
    zimo(zimo)         {}
    dapai(dapai)       {}
    fulou(fulou)       {}
    gang(gang)         {}
    gangzimo(gangzimo) {}
    kaigang(kaigang)   {}
    hule(hule)         {}
    pingju(pingju)     {}
    last(log)          {}

    watch(l) {
        return this.viewpoint == null ||
                    l != null
                &&  (this.__qijia + this.__jushu + l) % 4 == this.viewpoint;
    }

    idx(l) {
        let id = l != null              ? (this.__qijia + this.__jushu + l) % 4
               : this.viewpoint != null ? this.viewpoint
               :                          '';
        return `${this.basename}/${id}/${this.__n_ju}`;
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
            t++;
            let viewpoint;
            if (argv.player) {
                let player = log.paipu.player.map((p)=>p.replace(/\n.*$/,''));
                viewpoint = player.indexOf(argv.player);
                if (viewpoint == -1) continue;
            }
            else {
                viewpoint = argv.viewpoint;
            }
            analog.analyze(log.basename, log.paipu, viewpoint);
            if (argv.times && t >= argv.times) break;
        }

        syslog(t);
        return analog;
    }
}
