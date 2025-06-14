/*
 *  牌の危険度決定アルゴリズムの評価
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

/*
 *  ドラ表示牌・手牌・副露面子・捨て牌 に見える牌を順に返すイテレータ
 */
function* get_pai(board, lv) {

    /* ドラ表示牌 */
    for (let p of board.shan.baopai) yield p;

    for (let l = 0; l < 4; l++) {

        /* 手牌と副露面子 */
        let shoupai = board.shoupai[l].toString();
        if (l != lv) shoupai = shoupai.replace(/^[^,]*/,'');
        for (let suitstr of shoupai.match(/[mpsz][\d\+\=\-]+/g)||[]) {
            let s = suitstr[0];
            for (let n of suitstr.match(/\d/g)) {
                yield s+n;
            }
        }

        /* 捨て牌 */
        for (let p of board.he[l]._pai) {
            if (! p.match(/[\+\=\-]$/)) yield p.slice(0,2);
        }
    }
}

/*
 *  ドラ表示牌・手牌・副露面子・捨て牌 に見える牌をカウントする
 */
function get_paishu(board, lv) {
    let paishu = {
        m: [0,4,4,4,4,4,4,4,4,4],
        p: [0,4,4,4,4,4,4,4,4,4],
        s: [0,4,4,4,4,4,4,4,4,4],
        z: [0,4,4,4,4,4,4,4],
    };
    for (let p of get_pai(board, lv)) {
        let s = p[0], n = +p[1]||5;
        paishu[s][n]--;
    }
    return paishu;
}

/*
 *  評価対象外のリーチか判定する
 */
function bad_case(suanpai, shoupai, bingpai) {

    /* 国士無双のリーチは対象外 */
    shoupai = shoupai.clone();
    if (shoupai._zimo) shoupai.dapai(shoupai._zimo);
    let mm = Majiang.Util.hule_mianzi(shoupai, suanpai.hulepai[0]);
    if (mm[0].length == 13) return true;

    for (let p of suanpai.hulepai) {
        let s = p[0], n = +p[1]||5;
        if (suanpai.dapai[p]) return true;      // フリテンは対象外
        if (calc_combo(suanpai, p, bingpai[s][n]) == 0) return true;
                                                // カラテンは対象外
    }
    return false;
}

/*
 *  推定なし の危険度決定
 */
function fixed_risk(suanpai, p, c) {
    let s = p[0], n = +p[1]||5;
    return suanpai.dapai[s+n] ? 0 : 1;
}

/*
 *  コンボ数カウント
 */
function calc_combo(suanpai, p, c) {

    let s = p[0], n = +p[1]||5;
    let dapai = suanpai.dapai, paishu = suanpai.paishu[s];

    let r = 0;                              // 初期値は 0
    if (dapai[s+n]) return r;               // 現物は 0

    /* 対子 */
    r += Math.max(paishu[n] - (c ? 0 : 1), 0);
                                    // 生牌: 3、1枚切れ: 2、2枚切れ: 1、3枚切れ: 0
    /* 刻子 */
    r += paishu[n] - (c ? 0 : 1) >= 3 ? 3   // 生牌: 3
       : paishu[n] - (c ? 0 : 1) == 2 ? 1   // 1枚切れ: 1
       :                                0;  // 2枚切れ: 0
    if (s == 'z') return r;                 // 字牌の場合は順子の計算は不要

    r += n - 2 <  1                   ? 0   // 範囲外
       : n - 3 >= 1 && dapai[s+(n-3)] ? 0   // スジ
       : paishu[n-2] * paishu[n-1];
    r += n - 1 <  1                   ? 0   // 範囲外
       : n + 1 >  9                   ? 0   // 範囲外
       : paishu[n-1] * paishu[n+1];
    r += n + 2 >  9                   ? 0   // 範囲外
       : n + 3 <= 9 && dapai[s+(n+3)] ? 0   // スジ
       : paishu[n+1] * paishu[n+2];
    return r;
}

/*
 *  電脳麻将(旧方式) の危険度決定
 */
function suan_weixian_old(suanpai, p, c) {

    let s = p[0], n = +p[1]||5;
    let dapai = suanpai.dapai, paishu = suanpai.paishu[s];

    if (dapai[s+n]) return 0;                   // 現物は 0

    /* 字牌は見えている枚数から決定する */
    if (s == 'z') return Math.min(paishu[n] - (c ? 0 : 1), 3);

    /* 数牌はスジ・無スジで決定する */
    if (n == 1)   return dapai[s+'4'] ? 3: 6;   // 数牌 1
    if (n == 2)   return dapai[s+'5'] ? 4: 8;   // 数牌 2
    if (n == 3)   return dapai[s+'6'] ? 5: 8;   // 数牌 3
    if (n == 7)   return dapai[s+'4'] ? 5: 8;   // 数牌 7
    if (n == 8)   return dapai[s+'5'] ? 4: 8;   // 数牌 8
    if (n == 9)   return dapai[s+'6'] ? 3: 6;   // 数牌 9
                                                // 数牌 4・5・6
    return dapai[s+(n-3)] && dapai[s+(n+3)] ?  4    // 中スジ
         : dapai[s+(n-3)] || dapai[s+(n+3)] ?  8    // 片スジ
         :                                    12;   // 無スジ
}

/*
 *  電脳麻将(現方式) の危険度決定
 */
function suan_weixian(suanpai, p, c) {

    let s = p[0], n = +p[1]||5;
    let dapai = suanpai.dapai, paishu = suanpai.paishu[s];

    let r = 0;                      // 初期値は 0
    if (dapai[s+n]) return r;       // 現物は 0

    /* 対子もしくは刻子 */
    r += paishu[n] - (c ? 0 : 1) == 3 ? (s == 'z' ? 8 : 3)  // 生牌: 単騎＋双碰
       : paishu[n] - (c ? 0 : 1) == 2 ?             3   // 1枚切れ: 単騎＋双碰
       : paishu[n] - (c ? 0 : 1) == 1 ?             1   // 2枚切れ: 単騎のみ
       :                                            0;  // ラス牌: 0
    if (s == 'z') return r;             // 字牌の場合は嵌張、辺張、両面の計算は不要

    /* n-2, n-1, n の順子 */
    r += n - 2 <  1                              ?  0   // 範囲外
       : Math.min(paishu[n-2], paishu[n-1]) == 0 ?  0   // カベ
       : n - 2 == 1                              ?  3   // 辺張
       : dapai[s+(n-3)]                          ?  0   // スジ
       :                                           10;  // 両面
    /* n-1, n, n+1 の順子 */
    r += n - 1 <  1                              ?  0   // 範囲外
       : n + 1 >  9                              ?  0   // 範囲外
       : Math.min(paishu[n-1], paishu[n+1]) == 0 ?  0   // カベ
       :                                            3;  // 嵌張
    /* n, n+1, n+2 の順子 */
    r += n + 2 >  9                              ?  0   // 範囲外
       : Math.min(paishu[n+1], paishu[n+2]) == 0 ?  0   // カベ
       : n + 2 == 9                              ?  3   // 辺張
       : dapai[s+(n+3)]                          ?  0   // スジ
       :                                           10;  // 両面
    return r;
}

/*
 *  電脳麻将(改善案) の危険度決定
 */
function suan_weixian_new(suanpai, p, c) {

    let s = p[0], n = +p[1]||5;
    let dapai = suanpai.dapai, paishu = suanpai.paishu[s];

    let r = 0;                      // 初期値は 0
    if (dapai[s+n]) return r;       // 現物は 0

    /* 対子もしくは刻子 */
    r += paishu[n] - (c ? 0 : 1) == 3 ? (s == 'z' ? 8 : 3)      // 生牌
       : paishu[n] - (c ? 0 : 1) == 2 ? 1 * 2 / 3 + 2 * 1 / 3   // 1枚切れ
       : paishu[n] - (c ? 0 : 1) == 1 ? 1 * 1 / 3               // 2枚切れ
       :                                0;                      // ラス牌
    if (s == 'z') return r;             // 字牌の場合は嵌張、辺張、両面の計算は不要

    /* n-2, n-1, n の順子 */
    r += n - 2 <  1     ?  0                                    // 範囲外
       : n - 2 == 1     ?  3 * paishu[n-2] * paishu[n-1] / 16   // 辺張
       : dapai[s+(n-3)] ?  0                                    // スジ
       :                  10 * paishu[n-2] * paishu[n-1] / 16;  // 両面
    /* n-1, n, n+1 の順子 */
    r += n - 1 <  1     ?  0                                    // 範囲外
       : n + 1 >  9     ?  0                                    // 範囲外
       :                   3 * paishu[n-1] * paishu[n+1] / 16;  // 嵌張
    /* n, n+1, n+2 の順子 */
    r += n + 2 >  9     ?  0                                    // 範囲外
       : n + 2 == 9     ?  3 * paishu[n+1] * paishu[n+2] / 16   // 辺張
       : dapai[s+(n+3)] ?  0                                    // スジ
       :                  10 * paishu[n+1] * paishu[n+2] / 16;  // 両面
    return r;
}

const METHOD = {
    '推定なし': fixed_risk,
    'コンボ理論': calc_combo,
    '電脳麻将(旧方式)': suan_weixian_old,
    '電脳麻将(現方式)': suan_weixian,
    '電脳麻将(改良案)': suan_weixian_new,
};

/*
 *  method で指定されたアルゴリズムで牌ごとの危険度を決定し、正規化する
 */
function make_weixian(suanpai, bingpai, method) {
    let weixian = {}, sum = 0;
    for (let s of ['m','p','s','z']) {
        for (let n = 1; n < bingpai[s].length; n++) {
            weixian[s+n] = method(suanpai, s+n, bingpai[s][n]);
            sum += weixian[s+n];
        }
    }
    if (argv.verbose) console.log(weixian, sum);
    for (let p of Object.keys(weixian)) {
        weixian[p] = weixian[p] / sum;
    }
    return weixian;
}

/*
 *  二乗平均平方根誤差
 */
function eval_by_RMSE(hulepai, weixian) {
    let sum = 0, num = 0;
    for (let s of ['m','p','s','z']) {
        for (let n = 1; n <= (s == 'z' ? 7 : 9); n++) {
            num++;
            let v = (hulepai.find(p => p == s+n) ? 1 : 0) / hulepai.length;
            let w = weixian[s+n];
            sum +=  (v - w) ** 2;
        }
    }
    return Math.sqrt(sum / num);
}

/*
 *  交差エントロピー誤差
 */
function eval_by_CEloss(hulepai, weixian) {

    function CEloss(p, weixian) {
        let sum = 0;
        for (let s of ['m','p','s','z']) {
            for (let n = 1; n <= (s == 'z' ? 7 : 9); n++) {
                let w = weixian[s+n];
                sum += p == s+n ? Math.log(w) : Math.log(1 - w);
            }
        }
        return - sum;
    }

    let sum = 0, num = 0;
    for (let p of hulepai) {
        num++;
        sum += CEloss(p, weixian);
    }
    return sum / num;
}

/*
 *  全てのアルゴリズムで危険度を決定し、それを評価する
 */
function eval_method_all(result, when, suanpai, bingpai) {

    for (let method of Object.keys(METHOD)) {

        /* 危険度を決定する */
        if (argv.verbose) console.log('**', when, method);
        let weixian = make_weixian(suanpai, bingpai, METHOD[method]);

        /* 二乗平均平方根誤差で評価する */
        let rm = eval_by_RMSE(suanpai.hulepai, weixian);
        if (argv.verbose) console.log('RMSE', rm);
        result[method][when].RMSE += rm;

        /* 交差エントロピー誤差で評価する */
        let ce = eval_by_CEloss(suanpai.hulepai, weixian);
        if (argv.verbose) console.log('CEloss', ce);
        result[method][when].CEloss += ce;

        result[method][when].num++;
    }
}

/*
 *  集計方法定義
 */
class AnaLog extends require('../') {

    init() {
        /* 集計表を初期化する */
        this._result = {};
        for (let method of Object.keys(METHOD)) {
            this._result[method] = {
                '立直直後': { RMSE: 0, CEloss: 0, num: 0 },
                '終局直前': { RMSE: 0, CEloss: 0, num: 0 }
            };
        }
    }
    log(log) {
        /* 配牌に先立ち本局の総ツモ数をカウントしておく */
        this._suanpai = {};
        this._n_zimo = log.filter(d => d.zimo || d.gangzimo).length;
        super.log(log);
    }
    zimo(zimo) {
        let suanpai = this._suanpai;
        this._n_zimo--;
        /* 最後のツモの場合、危険度計算とその評価を行う */
        if (! this._n_zimo && suanpai.lizhi != null) {
            let lv = (suanpai.lizhi + viewpoint) % 4;           // 観察者を決定
            suanpai.paishu = get_paishu(this.board, lv);        // 残牌数を取得
            let shoupai = this.board.shoupai[suanpai.lizhi];    // 立直者の手牌
            let bingpai = this.board.shoupai[lv]._bingpai;      // 観察者の手牌
            if (! bad_case(suanpai, shoupai, bingpai)) {
                eval_method_all(this._result, '終局直前', suanpai, bingpai);
                                                    // 危険度計算とその評価を実施
            }
        }
    }
    gangzimo(gangzimo) {
        this.zimo(gangzimo);
    }
    dapai(dapai) {
        let suanpai = this._suanpai;
        /* 立直宣言の場合、危険度計算とその評価を行う */
        if (dapai.p.slice(-1) == '*' && suanpai.lizhi == null) {
            let lv = (dapai.l + viewpoint) % 4;                 // 観察者を決定
            if (argv.verbose) console.log(this.idx(lv));
            suanpai.lizhi   = dapai.l;                          // 立直者を決定
            suanpai.paishu  = get_paishu(this.board, lv);       // 残牌数を取得
            suanpai.dapai   = this.board.he[suanpai.lizhi]._find;
                                                                // 現物を取得
            suanpai.hulepai = Majiang.Util.tingpai(
                                    this.board.shoupai[suanpai.lizhi]);
                                                                // 待ち牌を取得
            let shoupai = this.board.shoupai[suanpai.lizhi];    // 立直者の手牌
            let bingpai = this.board.shoupai[lv]._bingpai;      // 観察者の手牌
            if (! bad_case(suanpai, shoupai, bingpai)) {
                eval_method_all(this._result, '立直直後', suanpai, bingpai);
                                                    // 危険度計算とその評価を実施
            }
        }
        else if (suanpai.lizhi != null) {
            suanpai.dapai[dapai.p.slice(0,2)] = true;   // 立直後の打牌を現物に追加
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>...')
    .option('recursive', { alias: 'r', boolean: true })
    .option('times',     { alias: 't' })
    .option('silent',    { alias: 's', boolean: true })
    .option('verbose',   { alias: 'v', boolean: true })
    .option('viewpoint', { alias: 'p', default: 1    })
    .demandCommand(1)
    .argv;
const filename = argv._;

const viewpoint = argv.viewpoint % 4;

let rv = AnaLog.analyze(filename, argv)._result;
if (argv.verbose) console.log(rv);

/* 評価結果を表示する */
for (let method of Object.keys(METHOD)) {
    console.log(
        method,
        '立直直後',
        'RMSE:',
        (rv[method]['立直直後'].RMSE / rv[method]['立直直後'].num).toFixed(5),
        'CEloss:',
        (rv[method]['立直直後'].CEloss / rv[method]['立直直後'].num).toFixed(5),
        '終局直前',
        'RMSE:',
        (rv[method]['終局直前'].RMSE / rv[method]['終局直前'].num).toFixed(5),
        'CEloss:',
        (rv[method]['終局直前'].CEloss / rv[method]['終局直前'].num).toFixed(5)
    );
}
