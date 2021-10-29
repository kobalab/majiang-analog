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
    qipai(qipai)       { this._model.qipai(qipai)     }
    zimo(zimo)         { this._model.zimo(zimo)       }
    dapai(dapai)       { this._model.dapai(dapai)     }
    fulou(fulou)       { this._model.fulou(fulou)     }
    gang(gang)         { this._model.gang(gang)       }
    gangzimo(gangzimo) { this._model.zimo(gangzimo)   }
    kaigang(kaigang)   { this._model.kaigang(kaigang) }
    hule(hule)         { this._model.hule(hule)       }
    pingju(pingju)     { this._model.pingju(pingju)   }
}
