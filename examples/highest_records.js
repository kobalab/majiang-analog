/*
 *  最高記録
 */
"use strict";

function shoupai_length(shoupai) {
    let rv = 0;
    for (let m of shoupai._fulou) {
        m = m.replace(/(:?\d{3}[\+\=\-])\d/, '$1');
        rv += (m.match(/\d/g)||[]).length * 10;
        rv += m.match(/[\+\=\-]/) ? 4 : 0;
    }
    return rv;
}

class AnaLog extends require('../') {
    init() {
        this._game      = 0;    // 総対局数
        this._log       = 0;    // 総局数
        this._jushu     = 0;    // 最大局数
        this._defen     = 0;    // 最高得点
        this._hule      = 0;    // 最高打点
        this._hupai     = 0;    // 最大役数
        this._fanshu    = 0;    // 最大翻数
        this._changbang = 0;    // 最大の本場
        this._lizhibang = 0;    // 最大供託数
        this._shoupai   = 0;    // 最長の手牌
        this._he        = 0;    // 最長の河
        this._fulou     = 0;    // 最大副露数
    }
    kaiju(paipu) {
        this._game++;
        for (let id = 0; id < 4; id++) {
            if (paipu.defen[id] > this._defen) {
                this._defen = paipu.defen[id];
                console.log(this.idx(), 'defen', this._defen);
            }
        }
        if (paipu.log.length > this._jushu) {
            this._jushu = paipu.log.length;
            console.log(this.idx(), 'jushu', this._jushu);
        }
    }
    qipai(qipai) {
        this._log++;
        if (qipai.changbang > this._changbang) {
            this._changbang = qipai.changbang;
            console.log(this.idx(), 'changbang', this._changbang);
        }
    }
    hule(hule) {
        if (hule.defen > this._hule) {
            this._hule = hule.defen;
            console.log(this.idx(hule.l), 'hule', this._hule);
        }
        if (hule.hupai.length > this._hupai) {
            this._hupai = hule.hupai.length;
            console.log(this.idx(hule.l), this._hupai, hule.hupai);
        }
        if (! hule.damanguan) {
            let fanshu = hule.hupai.map(h => h.fanshu).reduce((x, y) => x + y);
            if (fanshu > this._fanshu) {
                this._fanshu = fanshu;
                console.log(this.idx(hule.l), this._fanshu, hule.hupai);
            }
        }
        if (this.board.lizhibang > this._lizhibang) {
            this._lizhibang = this.board.lizhibang;
            console.log(this.idx(hule.l), 'lizhibang', this._lizhibang);
        }
    }
    last() {
        for (let l = 0; l < 4; l++) {
            let shoupai = shoupai_length(this.board.shoupai[l]);
            if (shoupai > this._shoupai) {
                this._shoupai = shoupai;
                console.log(this.idx(l), this._shoupai / 10,
                            this.board.shoupai[l]._fulou);
            }
            let he = this.board.he[l]._pai
                        .filter(p => ! p.match(/[\+\=\-]/)).length;
            if (he > this._he) {
                this._he = he;
                console.log(this.idx(l), 'he', this._he);
            }
        }
        let fulou = this.board.shoupai
                        .map(s => s._fulou.length).reduce((x, y)=> x + y);
        if (fulou > this._fulou) {
            this._fulou = fulou;
            console.log(this.idx(), 'fulou', this._fulou);
        }
        if (this.board.lizhibang > this._lizhibang) {
            this._lizhibang = this.board.lizhibang;
            console.log(this.idx(), 'lizhibang', this._lizhibang);
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>...')
    .option('times',     { alias: 't' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._;

let { _game, _log } = AnaLog.analyze(filename, argv);
console.log({ game: _game, log: _log});
