/*
 *  analog
 */
"use strict";

const AnaLogBase = require('./base');
const Majiang    = require('@kobalab/majiang-core');

module.exports = class AnaLog extends AnaLogBase {

    analyze(basename, paipu, player_id) {
        this.board = new Majiang.Board(paipu);
        super.analyze(basename, paipu, player_id);
    }
    __qipai(qipai)     { this.board.qipai(qipai);     this.qipai(qipai)     }
    __zimo(zimo)       { this.board.zimo(zimo);       this.zimo(zimo)       }
    __dapai(dapai)     { this.board.dapai(dapai);     this.dapai(dapai)     }
    __fulou(fulou)     { this.board.fulou(fulou);     this.fulou(fulou)     }
    __gang(gang)       { this.board.gang(gang);       this.gang(gang)       }
    __gangzimo(zimo)   { this.board.zimo(zimo);       this.gangzimo(zimo)   }
    __kaigang(kaigang) { this.board.kaigang(kaigang); this.kaigang(kaigang) }
    __hule(hule)       { this.board.hule(hule);       this.hule(hule)       }
    __pingju(pingju)   { this.board.pingju(pingju);   this.pingju(pingju)   }
    __last(log)        { this.board.last();           this.last(log)        }
}
