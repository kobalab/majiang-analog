/*
 *  モロ引っ掛けの危険度
 */
"use strict";

const Majiang = require('@kobalab/majiang-core');

const TINGPAI_TYPE = ['単騎','双碰','嵌張','辺張','両面'];

/*
 *  待ちの形を分類する
 */
function get_tingpai_type(shoupai, p) {
    const get_type = (m)=>
          m.match(/^[mps]\d{14}_!$/)      ? -1  // 九蓮宝燈
        : m.match(/^[mpsz](\d)\1_!$/)     ?  0  // 単騎
        : m.match(/^[mpsz](\d)\1\1_!$/)   ?  1  // 双碰
        : m.match(/^[mps]\d\d_!\d$/)      ?  2  // 嵌張
        : m.match(/^[mps](123_!|7_!89)$/) ?  3  // 辺張
        :                                    4; // 両面
    return TINGPAI_TYPE[
        Math.max(... Majiang.Util.hule_mianzi(shoupai.clone().zimo(p))
                            .map(mm=>get_type(mm.find(m=>m.match(/\!/))))) ];
}

/*
 *  初期化したテンパイ形ごとの集計表を返す
 */
function init_tingpai_type() {
    let tingpai_type = {};
    for (let key of TINGPAI_TYPE) {
        tingpai_type[key] = 0;
    }
    return tingpai_type;
}

/*
 *  集計方法定義
 */
class AnaLog extends require('../') {

    init() {
        this._result = {                            // 集計表
            '4': { n: 0, '7': init_tingpai_type() },    // 4切り → 7待ち
            '5': { n: 0, '2': init_tingpai_type(),      // 6切り → 2待ち
                         '8': init_tingpai_type() },    //       → 8待ち
            '6': { n: 0, '3': init_tingpai_type() },    // 6切り → 3待ち
        };
    }

    dapai(dapai) {
        let r = this._result;
        if (dapai.p.substr(-1) == '*') {    // リーチがあった場合

            let shoupai = this.board.shoupai[dapai.l];  // リーチ者の手牌を取得

            /* フリテンリーチを除外 */
            let tingpai = Majiang.Util.tingpai(shoupai);
            if (tingpai.find(p=> this.board.he[dapai.l].find(p))) return;

            /* 国士無双のリーチを除外 */
            let mm = Majiang.Util.hule_mianzi(shoupai.clone().zimo(tingpai[0]));
            if (mm[0].length == 13) return;

            let s = dapai.p[0], n = +dapai.p[1]||5;
            if (s == 'z') return;                   // 字牌は集計対象外
            if (n == 4) {                           // 4切りリーチ
                r['4'].n++;
                if (tingpai.find(p=> p == s+'7'))   // 7が待ちにある
                            r['4']['7'][get_tingpai_type(shoupai, s+'7')]++;
            }
            else if (n == 5) {                      // 5切りリーチ
                r['5'].n++;
                if (tingpai.find(p=> p == s+'2'))   // 2が待ちにある
                            r['5']['2'][get_tingpai_type(shoupai, s+'2')]++;
                if (tingpai.find(p=> p == s+'8'))   // 8が待ちにある
                            r['5']['8'][get_tingpai_type(shoupai, s+'8')]++;
            }
            else if (n == 6) {                      // 6切りリーチ
                r['6'].n++;
                if (tingpai.find(p=> p == s+'3'))   // 3が待ちにある
                            r['6']['3'][get_tingpai_type(shoupai, s+'3')]++;
            }
        }
    }
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>...')
    .option('recursive', { alias: 'r', boolean: true })
    .option('times',     { alias: 't' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._;

console.log(AnaLog.analyze(filename, argv)._result);
