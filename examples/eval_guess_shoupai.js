/*
 *  手牌推定のアルゴリズムを評価する
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
 *  卓情報 board から手番 lv 以外の手牌にある牌数をカウントし、返す。
 */
function get_shoupaishu(board, lv) {
    let paishu = {};
    for (let s of ['m','p','s','z']) {
        for (let n = 1; n <= (s == 'z' ? 7 : 9); n++) {
            paishu[s+n] = 0;
            for (let l = 0; l < 4; l++) {
                if (l == lv) continue;
                paishu[s+n] += board.shoupai[l]._bingpai[s][n];
            }
        }
    }
    return paishu;
}

/*
 *  牌をキーとするハッシュを console.table() で表示可能な形式に変換する
 *  fixed が指定された場合は、小数点以下をその桁数に丸めて返す
 */
function make_table(hash, fixed) {
    let table = {
        m: [0,0,0,0,0,0,0,0,0,0],
        p: [0,0,0,0,0,0,0,0,0,0],
        s: [0,0,0,0,0,0,0,0,0,0],
        z: [0,0,0,0,0,0,0,0],
    };
    for (let s of ['m','p','s','z']) {
        for (let n = 1; n < table[s].length; n++) {
            table[s][n] = (fixed == null) ? hash[s+n]
                                          : + hash[s+n].toFixed(fixed);
        }
    }
    return table;
}

/*
 *  コンボ数計算
 */
function calc_combo(paishu, p) {

    let s = p[0], n = +p[1]||5;

    let r = 0;                              // 初期値は 0
    if (paishu[s][p] == 0) return r;        // 0 枚の牌は 0

    r += paishu[s][n];                      // 対子
    r += [0, 0, 1, 3, 6][paishu[s][n]];     // 刻子
    if (s == 'z') return r;                 // 字牌の場合は順子の計算は不要

    r += n - 2 <  1                   ? 0   // 範囲外
       : paishu[s][n-2] * paishu[s][n-1];
    r += n - 1 <  1                   ? 0   // 範囲外
       : n + 1 >  9                   ? 0   // 範囲外
       : paishu[s][n-1] * paishu[s][n+1];
    r += n + 2 >  9                   ? 0   // 範囲外
       : paishu[s][n+1] * paishu[s][n+2];
    return r;
}

/*
 *  牌 p の統計的な手牌存在率を返す
 */
function shoupai_rate(p) {
    let s = p[0], n = +p[1]||5;
    return  s == 'z'         ? 0.23
          : n == 1 || n == 9 ? 0.33
          : n == 2 || n == 8 ? 0.54
          : n == 3 || n == 7 ? 0.67
          : n == 4 || n == 6 ? 0.71
          :                    0.74;
}

/*
 *  推定なし
 *      見えていない牌数に比例した手牌密度とする
 */
function averaging_method(paishu, p) {
    let s = p[0], n = +p[1]||5;
    return paishu[s][n];
}

/*
 *  コンボ理論
 *      コンボ数 × 牌数 に比例した手牌密度とする
 */
function combo_method(paishu, p) {
    let s = p[0], n = +p[1]||5;
    return calc_combo(paishu, p) * paishu[s][n];
}

/*
 *  統計的推定
 *      各牌の統計上の手牌存在率 × 牌数 に比例した手牌密度とする
 */
function statistical_method(paishu, p) {
    let s = p[0], n = +p[1]||5;
    return shoupai_rate(p) * paishu[s][n];
}

/*
 *  統計コンボ
 *      コンボ数 × 統計上の手牌存在率 × 牌数 に比例した手牌密度とする
 */
function statistical_combo(paishu, p){
    let s = p[0], n = +p[1]||5;
    return calc_combo(paishu, p) / 54 * shoupai_rate(p) * paishu[s][n];
}

const METHOD = {
    '推定なし': averaging_method,
    'コンボ理論': combo_method,
    '統計的推定': statistical_method,
    '統計コンボ': statistical_combo,
};

/*
 *  見えていない牌数 paishu からアルゴリズム method を使って手牌密度を推定し、返す
 */
function guess_shoupai(paishu, method) {

    let guess = {}, sum = 0;

    /* 34種の牌それぞれについて method を使って「存在度」を推定する */
    for (let s of ['m','p','s','z']) {
        for (let n = 1; n <= (s == 'z' ? 7 : 9); n++) {
            guess[s+n] = method(paishu, s+n);
            sum += guess[s+n];
        }
    }
    if (argv.verbose) console.log(method);
    if (argv.verbose) console.table(make_table(guess, 2));

    /* 「存在度」をその総和が1となる手牌密度に正規化して返す */
    for (let p of Object.keys(guess)) {
        guess[p] = guess[p] / sum;
    }
    return guess;
}

/*
 *  手牌密度 guess と手牌枚数の総和 sum から、各々の牌の枚数を決定し、返す
 */
function calc_shoupai(guess, sum, fixed) {
    let shoupai = {
        m: [0,0,0,0,0,0,0,0,0,0],
        p: [0,0,0,0,0,0,0,0,0,0],
        s: [0,0,0,0,0,0,0,0,0,0],
        z: [0,0,0,0,0,0,0,0],
    };
    for (let s of ['m','p','s','z']) {
        for (let n = 1; n < shoupai[s].length; n++) {
            shoupai[s][n] = (fixed == null ) ? sum * guess[s+n]
                          : + (sum * guess[s+n]).toFixed(fixed);
        }
    }
    return shoupai;
}

/*
 *  二乗平均平方根誤差
 */
function eval_by_RMSE(shoupaishu, guess) {
    let sum_shoupaishu = Object.keys(shoupaishu).map(p => shoupaishu[p])
                                                .reduce((x, y)=> x + y, 0);
    let sum = 0, num = 0;
    for (let p of Object.keys(guess)) {
        num++;
        sum += (shoupaishu[p] - sum_shoupaishu * guess[p]) ** 2;
    }
    return Math.sqrt(sum / num);
}

/*
 *  交差エントロピー誤差
 */
function eval_by_CEloss(shoupaishu, guess) {

    function CEloss(p, n, guess) {
        let sum = 0;
        for (let g of Object.keys(guess)) {
            sum += (g == p) ? Math.log(guess[g]) : Math.log(1 - guess[g]);
        }
        return -sum * n;
    }

    let sum = 0, num = 0;
    for (let p of Object.keys(shoupaishu)) {
        if (shoupaishu[p] == 0) continue;
        num += shoupaishu[p];
        sum += CEloss(p, shoupaishu[p], guess);
    }
    return sum / num;
}

/*
 *  全てのアルゴリズムで手牌密度を推定し、それを評価する
 */
function eval_method_all(result, when, board, lv) {

    if (argv.verbose) console.log('-', when + 1);

    /* 集計表が足りなければ追加する */
    if (! result[when]) {
        result[when] = {};
        for (let methd of Object.keys(METHOD)) {
            result[when][methd] = { RMSE: 0, CEloss: 0, num: 0 };
        }
    }

    /* 卓情報 board から手番 lv から見えていない牌数を取得する　*/
    const paishu = get_paishu(board, lv);
    if (argv.verbose) console.log('見えていない牌数');
    if (argv.verbose) console.table(paishu);

    /* 卓情報 board から手番 lv 以外の手牌の枚数を取得する */
    const shoupaishu = get_shoupaishu(board, lv);
    let sum_shoupaishu = Object.keys(shoupaishu).map(p => shoupaishu[p])
                                                .reduce((x, y)=> x + y, 0);
    if (argv.verbose) console.log('実際の手牌');
    if (argv.verbose) console.table(make_table(shoupaishu));

    for (let method of Object.keys(METHOD)) {

        /* アルゴリズム method で手牌密度を推定する */
        let guess = guess_shoupai(paishu, METHOD[method]);
        if (argv.verbose) console.log(`推定(${method})`)
        if (argv.verbose) console.table(calc_shoupai(guess, sum_shoupaishu, 1));

        /* 二乗平均平方根誤差で評価する */
        let rm = eval_by_RMSE(shoupaishu, guess);
        result[when][method].RMSE += rm;
        if (argv.verbose) console.log('RMSE', rm);

        /* 交差エントロピー誤差で評価する */
        let ce = eval_by_CEloss(shoupaishu, guess);
        result[when][method].CEloss += ce;
        if (argv.verbose) console.log('CEloss', ce);

        result[when][method].num++;
    }
}

/*
 *  集計方法定義
 */
class AnaLog extends require('../') {

    init() {
        this._result = [];      // 集計表を初期化
    }

    qipai(qipai) {
        this._menfeng = this.board.menfeng(this.viewpoint);     // 視点の自風
        if (argv.verbose)
                console.log('**', ['東','南','西','北'][qipai.zhuangfeng]
                            + ['一','二','三','四'][qipai.jushu]
                            + `局 ${qipai.changbang}本場`);
    }
    zimo(zimo) {
        if (zimo.l == this._menfeng) {      // 視点のツモの場合
            /* 手牌推定のアルゴリズムを評価する */
            eval_method_all(this._result, this.board.he[zimo.l]._pai.length,
                            this.board, zimo.l);
        }
    }
    fulou(fulou) {
        if (fulou.l == this._menfeng) {     //視点の副露の場合
            /* 手牌推定のアルゴリズムを評価する */
            eval_method_all(this._result, this.board.he[fulou.l]._pai.length,
                            this.board, fulou.l);
        }
    }
    gangzimo(gangzimo) {
        this.zimo(gangzimo);    // ツモとして処理する
    }
}

/* コマンドラインのオプションと引数を取得する */
const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>...')
    .option('recursive', { alias: 'r', boolean: true })
    .option('times',     { alias: 't' })
    .option('silent',    { alias: 's', boolean: true })
    .option('verbose',   { alias: 'v', boolean: true })
    .option('viewpoint', { alias: 'p', default: 0    })
    .demandCommand(1)
    .argv;
const filename = argv._;

/* 評価を開始する */
let rv = AnaLog.analyze(filename, argv)._result;
if (argv.verbose) console.log(rv);

/* 評価結果を表示する */
for (let i = 0; i < rv.length; i++) {
    console.log(i + 1);
    for (let method of Object.keys(METHOD)) {
        console.log(
            method,
            'RMSE',   (rv[i][method].RMSE   / rv[i][method].num).toFixed(5),
            'CEloss', (rv[i][method].CEloss / rv[i][method].num).toFixed(5),
        );
    }
}
