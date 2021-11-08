/*
 *  リーチに対する待ちの形ごとの危険度
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

const PATTERN = [
    '生牌字牌', '1切れ字牌', '2切れ字牌', '3切れ字牌', '4切れ字牌', '現物字牌',
    '無スジ19牌', 'スジ19牌', '現物19牌',
    '無スジ28牌', 'スジ28牌', '現物28牌',
    '無スジ37牌', 'スジ37牌', '現物37牌',
    '無スジ456牌', '片スジ456牌', '中スジ456牌', '現物456牌',
];

const TINGPAI_TYPE = ['単騎','双碰','嵌張','辺張','両面'];

/*
 * 集計表を初期化する
 */
function init_pattern(init) {
    let pattern = {};
    for (let key of PATTERN) {
        pattern[key] = JSON.parse(JSON.stringify(init));
    }
    return pattern;
}

/*
 * 場に見えている牌の枚数を集計する
 */
function get_paishu(board) {
    let paishu = {
        m: [0,0,0,0,0,0,0,0,0],
        p: [0,0,0,0,0,0,0,0,0],
        s: [0,0,0,0,0,0,0,0,0],
        z: [0,0,0,0,0,0,0],
    };
    /* ドラ表示牌をカウント */
    for (let p of board.shan.baopai) {
        let s = p[0], n = + p[1] || 5;
        paishu[s][n-1]++;
    }
    for (let l = 0; l < 4; l++) {
        /* 河に見えている枚数をカウント */
        for (let p of board.he[l]._pai) {
            if (p.match(/[\+\=\-]$/)) continue; // 鳴かれた牌は副露メンツ側でカウント
            let s = p[0], n = + p[1] || 5;
            paishu[s][n-1]++;
        }
        /* 副露メンツに見えている牌をカウント */
        for (let m of board.shoupai[l]._fulou) {
            let s = m[0];
            for (let n of m.match(/\d/g)) {
                n = + n || 5;
                paishu[s][n-1]++;
            }
        }
    }
    return paishu;
}

/*
 *  危険度の観点でパターンを分類する
 */
function get_pattern(board, l, p, paishu) {
    let s = p[0], n = + p[1] || 5;
    const shoupai = board.shoupai[l], he = board.he[l];

    if (s == 'z') {                 // 字牌
        if (he.find(p)) return '現物字牌';
        return paishu[s][n-1] ? `${paishu[s][n-1]}切れ字牌` : '生牌字牌';
    }
    else {                          // 数牌
        if (n == 1) return he.find(s+n)         ? '現物19牌'
                         : he.find(s+(n+3))     ? 'スジ19牌' : '無スジ19牌';
        if (n == 2) return he.find(s+n)         ? '現物28牌'
                         : he.find(s+(n+3))     ? 'スジ28牌' : '無スジ28牌';
        if (n == 3) return he.find(s+n)         ? '現物37牌'
                         : he.find(s+(n+3))     ? 'スジ37牌' : '無スジ37牌';
        if (4 <= n && n <=6)
                    return he.find(s+n)         ? '現物456牌'
                         : he.find(s+(n+3)) &&
                           he.find(s+(n-3))     ? '中スジ456牌'
                         : he.find(s+(n+3)) ||
                           he.find(s+(n-3))     ? '片スジ456牌'
                         :                        '無スジ456牌';
        if (n == 7) return he.find(s+n)         ? '現物37牌'
                         : he.find(s+(n-3)) ? 'スジ37牌' : '無スジ37牌';
        if (n == 8) return he.find(s+n)     ? '現物28牌'
                         : he.find(s+(n-3)) ? 'スジ28牌' : '無スジ28牌';
        if (n == 9) return he.find(s+n)     ? '現物19牌'
                         : he.find(s+(n-3)) ? 'スジ19牌' : '無スジ19牌';
    }
}

/*
 *  待ちの形を分類する
 */
function get_tingpai_type(shoupai, p) {
    const get_type = (m)=>
          m.match(/^[mpsz](\d)\1_!$/)     ? 0
        : m.match(/^[mpsz](\d)\1\1_!$/)   ? 1
        : m.match(/^[mps]\d\d_!\d$/)      ? 2
        : m.match(/^[mps](123_!|7_!89)$/) ? 3
        :                                   4;
    return TINGPAI_TYPE[
        Math.max(... Majiang.Util.hule_mianzi(shoupai.clone().zimo(p))
                            .map(mm=>get_type(mm.find(m=>m.match(/\!/))))) ];
}

/*
 *  集計方法定義
 */
class AnaLog extends require('../') {

    init() {
        let tingpai_type = {};
        for (let tt of TINGPAI_TYPE) {
            tingpai_type[tt] = 0;
        }
        this._result = {
            all_lizhi: 0,
            n_lizhi:   0,
            all:    init_pattern(0),
            hule:   init_pattern(tingpai_type),
        };
    }
    dapai(dapai) {
        let r = this._result;
        if (dapai.p.substr(-1) == '*') {    // リーチがあった場合

            r.all_lizhi++;      // 総リーチ数を1加算

            let shoupai = this.board.shoupai[dapai.l];

            /* フリテンリーチを除外 */
            let tingpai = Majiang.Util.tingpai(shoupai);
            if (tingpai.find(p=> this.board.he[dapai.l].find(p))) return;

            /* 国士無双のリーチを除外 */
            let mm = Majiang.Util.hule_mianzi(shoupai.clone().zimo(tingpai[0]));
            if (mm[0].length == 13) return;

            r.n_lizhi++;        // 集計対象のリーチ数を1加算

            let paishu = get_paishu(this.board);    // 場に見えている牌の枚数を集計

            /* 全ての牌についてパターン分類する */
            for (let s of ['m','p','s','z']) {
                for (let n = 1; n <= paishu[s].length; n++) {
                    let pt = get_pattern(this.board, dapai.l, s+n, paishu);
                    r.all[pt]++;
                }
            }

            /* 待ち牌をパターン分類する */
            for (let p of tingpai) {
                let pt = get_pattern(this.board, dapai.l, p, paishu);
                let tt = get_tingpai_type(shoupai, p);
                r.hule[pt][tt]++;
            }
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>')
    .option('times',     { alias: 't' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._[0];

console.log(AnaLog.analyze(filename, argv)._result);
