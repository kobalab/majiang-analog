/*
 *  牌の危険度決定アルゴリズムの評価
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

function* get_pai(board, lv) {
    for (let p of board.shan.baopai) yield p;
    for (let l = 0; l < 4; l++) {
        let shoupai = board.shoupai[l].toString();
        if (l != lv) shoupai = shoupai.replace(/^[^,]*/,'');
        for (let suitstr of shoupai.match(/[mpsz][\d\+\=\-]+/g)||[]) {
            let s = suitstr[0];
            for (let n of suitstr.match(/\d/g)) {
                yield s+n;
            }
        }
        for (let p of board.he[l]._pai) {
            if (! p.match(/[\+\=\-]$/)) yield p.slice(0,2);
        }
    }
}

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

function bad_case(suanpai, shoupai, bingpai) {

    shoupai = shoupai.clone();
    if (shoupai._zimo) shoupai.dapai(shoupai._zimo);
    let mm = Majiang.Util.hule_mianzi(shoupai, suanpai.hulepai[0]);
    if (mm[0].length == 13) return true;

    for (let p of suanpai.hulepai) {
        let s = p[0], n = +p[1]||5;
        if (suanpai.dapai[p]) return true;
        if (calc_combo(suanpai, p, bingpai[s][n]) == 0) return true;
    }
    return false;
}

function fixed_risk(suanpai, p, c) {
    let s = p[0], n = +p[1]||5;
    return suanpai.dapai[s+n] ? 0 : 1;
}

function calc_combo(suanpai, p, c) {

    let s = p[0], n = +p[1]||5;
    let dapai = suanpai.dapai, paishu = suanpai.paishu[s];

    let r = 0;
    if (dapai[s+n]) return r;

    r += Math.max(paishu[n] - (c ? 0 : 1), 0);
    r += paishu[n] - (c ? 0 : 1) >= 3 ? 3
       : paishu[n] - (c ? 0 : 1) == 2 ? 1
       :                                0;
    if (s == 'z') return r;

    r += n - 2 <  1                   ? 0
       : n - 3 >= 1 && dapai[s+(n-3)] ? 0
       : paishu[n-2] * paishu[n-1];
    r += n - 1 <  1                   ? 0
       : n + 1 >  9                   ? 0
       : paishu[n-1] * paishu[n+1];
    r += n + 2 >  9                   ? 0
       : n + 3 <= 9 && dapai[s+(n+3)] ? 0
       : paishu[n+1] * paishu[n+2];
    return r;
}

function suan_weixian_old(suanpai, p, c) {

    let s = p[0], n = +p[1]||5;
    let dapai = suanpai.dapai, paishu = suanpai.paishu[s];

    if (dapai[s+n]) return 0;

    if (s == 'z') return Math.min(paishu[n] - (c ? 0 : 1), 3);
    if (n == 1)   return dapai[s+'4'] ? 3: 6;
    if (n == 2)   return dapai[s+'5'] ? 4: 8;
    if (n == 3)   return dapai[s+'6'] ? 5: 8;
    if (n == 7)   return dapai[s+'4'] ? 5: 8;
    if (n == 8)   return dapai[s+'5'] ? 4: 8;
    if (n == 9)   return dapai[s+'6'] ? 3: 6;
    return dapai[s+(n-3)] && dapai[s+(n+3)] ?  4
         : dapai[s+(n-3)] || dapai[s+(n+3)] ?  8
         :                                    12;
}

function suan_weixian(suanpai, p, c) {

    let s = p[0], n = +p[1]||5;
    let dapai = suanpai.dapai, paishu = suanpai.paishu[s];

    let r = 0;
    if (dapai[s+n]) return r;

    r += paishu[n] - (c ? 0 : 1) == 3 ? (s == 'z' ? 8 : 3)
       : paishu[n] - (c ? 0 : 1) == 2 ?             3
       : paishu[n] - (c ? 0 : 1) == 1 ?             1
       :                                            0;
    if (s == 'z') return r;

    r += n - 2 <  1                              ?  0
       : Math.min(paishu[n-2], paishu[n-1]) == 0 ?  0
       : n - 2 == 1                              ?  3
       : dapai[s+(n-3)]                          ?  0
       :                                           10;
    r += n - 1 <  1                              ?  0
       : n + 1 >  9                              ?  0
       : Math.min(paishu[n-1], paishu[n+1]) == 0 ?  0
       :                                            3;
    r += n + 2 >  9                              ?  0
       : Math.min(paishu[n+1], paishu[n+2]) == 0 ?  0
       : n + 2 == 9                              ?  3
       : dapai[s+(n+3)]                          ?  0
       :                                           10;
    return r;
}

function suan_weixian_new(suanpai, p, c) {

    let s = p[0], n = +p[1]||5;
    let dapai = suanpai.dapai, paishu = suanpai.paishu[s];

    let r = 0;
    if (dapai[s+n]) return r;

    r += paishu[n] - (c ? 0 : 1) == 3 ? (s == 'z' ? 8 : 3)
       : paishu[n] - (c ? 0 : 1) == 2 ?             3
       : paishu[n] - (c ? 0 : 1) == 1 ?             1
       :                                            0;
    if (s == 'z') return r;

    r += n - 2 <  1     ?  0
       : n - 2 == 1     ?  3 * paishu[n-2] * paishu[n-1] / 16
       : dapai[s+(n-3)] ?  0
       :                  10 * paishu[n-2] * paishu[n-1] / 16;
    r += n - 1 <  1     ?  0
       : n + 1 >  9     ?  0
       :                   3 * paishu[n-1] * paishu[n+1] / 16;
    r += n + 2 >  9     ?  0
       : n + 2 == 9     ?  3 * paishu[n+1] * paishu[n+2] / 16
       : dapai[s+(n+3)] ?  0
       :                  10 * paishu[n+1] * paishu[n+2] / 16;
    return r;
}

const METHOD = {
    '予測なし': fixed_risk,
    'コンボ理論': calc_combo,
    '電脳麻将(旧方式)': suan_weixian_old,
    '電脳麻将(現方式)': suan_weixian,
    '電脳麻将(改良案)': suan_weixian_new,
};

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

/* 二乗平均平方根誤差 */
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

/* 交差エントロピー誤差 */
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

function eval_method_all(result, when, suanpai, bingpai) {

    for (let method of Object.keys(METHOD)) {

        if (argv.verbose) console.log('**', when, method);
        let weixian = make_weixian(suanpai, bingpai, METHOD[method]);

        let rm = eval_by_RMSE(suanpai.hulepai, weixian);
        if (argv.verbose) console.log('RMSE', rm);
        result[method][when].RMSE += rm;

        let ce = eval_by_CEloss(suanpai.hulepai, weixian);
        if (argv.verbose) console.log('CEloss', ce);
        result[method][when].CEloss += ce;

        result[method][when].num++;
    }
}

class AnaLog extends require('../') {

    init() {
        this._result = {};
        for (let method of Object.keys(METHOD)) {
            this._result[method] = {
                '立直直後': { RMSE: 0, CEloss: 0, num: 0 },
                '終局直前': { RMSE: 0, CEloss: 0, num: 0 }
            };
        }
    }
    log(log) {
        this._suanpai = {};
        this._n_zimo = log.filter(d => d.zimo || d.gangzimo).length;
        super.log(log);
    }
    zimo(zimo) {
        let suanpai = this._suanpai;
        this._n_zimo--;
        if (! this._n_zimo && suanpai.lizhi != null) {
            let lv = (suanpai.lizhi + viewpoint) % 4;
            suanpai.paishu = get_paishu(this.board, lv);
            let shoupai = this.board.shoupai[suanpai.lizhi];
            let bingpai = this.board.shoupai[lv]._bingpai;
            if (! bad_case(suanpai, shoupai, bingpai)) {
                eval_method_all(this._result, '終局直前', suanpai, bingpai);
            }
        }
    }
    gangzimo(gangzimo) {
        this.zimo(gangzimo);
    }
    dapai(dapai) {
        let suanpai = this._suanpai;
        if (dapai.p.slice(-1) == '*' && suanpai.lizhi == null) {
            let lv = (dapai.l + viewpoint) % 4;
            if (argv.verbose) console.log(this.idx(lv));
            suanpai.lizhi   = dapai.l;
            suanpai.paishu  = get_paishu(this.board, lv);
            suanpai.dapai   = this.board.he[suanpai.lizhi]._find;
            suanpai.hulepai = Majiang.Util.tingpai(
                                    this.board.shoupai[suanpai.lizhi]);
            let shoupai = this.board.shoupai[suanpai.lizhi];
            let bingpai = this.board.shoupai[lv]._bingpai;
            if (! bad_case(suanpai, shoupai, bingpai)) {
                eval_method_all(this._result, '立直直後', suanpai, bingpai);
            }
        }
        else if (suanpai.lizhi != null) {
            suanpai.dapai[dapai.p.slice(0,2)] = true;
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
