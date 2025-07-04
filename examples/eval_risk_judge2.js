/*
 *  牌の危険度決定アルゴリズムの評価(2)
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
 *  ドラ表示牌・手牌・副露面子・捨て牌 に見える牌をカウントダウンする
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
 *  電脳麻将(改良案) の危険度決定
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
 *  KLダイバージェンス
 */
function eval_by_KLD(hulepai, weixian) {
    let sum = 0;
    for (let p of hulepai) {
        let v = 1 / hulepai.length;
        sum +=  v * Math.log(v / weixian[p]);
    }
    return sum;
}

/*
 *  全てのアルゴリズムで危険度を決定し、それを評価する
 */
function eval_method(result, board, suanpai) {

    let when = board.he[board.lunban]._pai.length;
    if (argv.verbose) console.log('-', when + 1);

    /* 集計表が足りなければ追加する */
    if (! result[when]) {
        result[when] = {};
        for (let methd of Object.keys(METHOD)) {
            result[when][methd] = { RMSE: 0, CEloss: 0, KLD: 0, num: 0 };
        }
    }

    suanpai.paishu = get_paishu(board, board.lunban);

    /* カラテンの単騎待ちがある場合は処理しない */
    for (let p of suanpai.hulepai) {
        let s = p[0], n = +p[1]||5;
        if (calc_combo(suanpai, p,
                    board.shoupai[board.lunban]._bingpai[s][n]) == 0) return;
    }

    for (let method of Object.keys(METHOD)) {

        /* 危険度を決定する */
        let weixian = make_weixian(
                            suanpai, board.shoupai[board.lunban]._bingpai,
                            METHOD[method]);
        if (argv.verbose) {
            let w = {};
            for (let p of Object.keys(weixian)) w[p] = weixian[p] * 100;
            console.log(method);
            console.table(make_table(w, 1));
        }

        /* 二乗平均平方根誤差で評価する */
        let rm = eval_by_RMSE(suanpai.hulepai, weixian);
        if (argv.verbose) console.log('RMSE', rm.toFixed(5));
        result[when][method].RMSE += rm;

        /* 交差エントロピー誤差で評価する */
        let ce = eval_by_CEloss(suanpai.hulepai, weixian);
        if (argv.verbose) console.log('CEloss', ce.toFixed(5));
        if (ce == Infinity) throw suanpai.lizhi;
        result[when][method].CEloss += ce;

        /* KLダイバージェンスで評価する */
        let kl = eval_by_KLD(suanpai.hulepai, weixian);
        if (argv.verbose) console.log('KLD', ce.toFixed(5));
        if (kl == Infinity) throw suanpai.lizhi;
        result[when][method].KLD += kl;

        result[when][method].num++;
    }
}

/*
 *  集計方法定義
 */
class AnaLog extends require('../') {

    init() {
        this._result = [];
    }
    qipai(qipai) {
        if (argv.verbose) {
            if (qipai.zhuangfeng == 0 && qipai.jushu == 0
                && qipai.changbang == 0)
            {
                console.log('====', this.basename);
            }
            console.log('**', ['東','南','西','北'][qipai.zhuangfeng]
                            + ['一','二','三','四'][qipai.jushu] + '局'
                            + ` ${qipai.changbang}本場`);
        }

        this._suanpai = { n_zimo: 70 };
    }
    zimo(zimo) {
        let suanpai = this._suanpai, board = this.board;
        suanpai.n_zimo--;
        if (suanpai.dapai && (suanpai.lizhi + argv.viewpoint) % 4 == zimo.l) {
            eval_method(this._result, board, suanpai);
                                                // 危険度判定とその評価を実施
        }
    }
    gangzimo(gangzimo) {
        this.zimo(gangzimo);
    }
    fulou(fulou) {
        let suanpai = this._suanpai, board = this.board;
        if (suanpai.dapai && (suanpai.lizhi + argv.viewpoint) % 4 == fulou.l) {
            eval_method(this._result, board, suanpai);
                                                // 危険度判定とその評価を実施
        }
    }
    dapai(dapai) {

        let suanpai = this._suanpai, board = this.board;

        if (dapai.p.slice(-1) == '*' && suanpai.lizhi == null) {
                                                    // その局最初の立直宣言の場合
            suanpai.lizhi   = dapai.l;                  // リーチ者
            suanpai.hulepai = Majiang.Util.tingpai(board.shoupai[dapai.l]);
                                                        // 和了牌
            suanpai.dapai   = board.he[dapai.l]._find;  // 現物
            suanpai.paishu  = get_paishu(board, (dapai.l + argv.viewpoint) % 4);
                                                        // 見えていない牌数
            /* 国士無双のリーチは対象外 */
            let mm = Majiang.Util.hule_mianzi(board.shoupai[dapai.l],
                                              suanpai.hulepai[0]);
            if (mm[0].length == 13) return delete suanpai.dapai;

            /* フリテンリーチは対象外 */
            for (let p of suanpai.hulepai) {
                if (suanpai.dapai[p]) return delete suanpai.dapai;
            }

            if (argv.verbose) {
                console.log('+',
                    board.player[board.player_id[dapai.l]].replace(/\n.*/,''),
                    board.shoupai[dapai.l].toString(), suanpai.hulepai);
            }
        }
        else if (suanpai.dapai) {                   // すでに調査中の場合
            let s = dapai.p[0], n = +dapai.p[1]||5;
            if (suanpai.hulepai.find(p => p == s+n))
                    delete suanpai.dapai;       // 和了牌が切られたら調査を打ち切る
            else    suanpai.dapai[s+n] = true;  // 捨て牌を現物に加える
        }
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
    .option('viewpoint', { alias: 'p', default: 1    })
    .demandCommand(1)
    .argv;
const filename = argv._;

/* 評価を開始する */
let rv = AnaLog.analyze(filename, argv)._result;
if (argv.verbose) console.log(rv);

/* 評価結果を表示する */
for (let i = 0; i < rv.length; i++) {
    console.log(i + 1);
    if (! rv[i]) continue;
    for (let method of Object.keys(METHOD)) {
        console.log(
            method,
            'RMSE',   (rv[i][method].RMSE   / rv[i][method].num).toFixed(5),
            'CEloss', (rv[i][method].CEloss / rv[i][method].num).toFixed(5),
            'KLD',    (rv[i][method].KLD    / rv[i][method].num).toFixed(5),
        );
    }
}
