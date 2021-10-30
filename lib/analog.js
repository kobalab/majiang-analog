/*
 *  analog
 */
"use strict";

const AnaLogBase = require('./base');
const Majiang    = require('@kobalab/majiang-core');

module.exports = class AnaLog extends AnaLogBase {

    analyze(basename, paipu, player_id) {
        this._model = new Majiang.Board(paipu);
        super.analyze(basename, paipu, player_id);
    }
    __qipai(qipai)     { this._model.qipai(qipai);     this.qipai(qipai)     }
    __zimo(zimo)       { this._model.zimo(zimo);       this.zimo(zimo)       }
    __dapai(dapai)     { this._model.dapai(dapai);     this.dapai(dapai)     }
    __fulou(fulou)     { this._model.fulou(fulou);     this.fulou(fulou)     }
    __gang(gang)       { this._model.gang(gang);       this.gang(gang)       }
    __gangzimo(zimo)   { this._model.zimo(zimo);       this.gangzimo(zimo)   }
    __kaigang(kaigang) { this._model.kaigang(kaigang); this.kaigang(kaigang) }
    __hule(hule)       { this._model.hule(hule);       this.hule(hule)       }
    __pingju(pingju)   { this._model.pingju(pingju);   this.pingju(pingju)   }
}
