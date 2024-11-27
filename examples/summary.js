/*
 *  基礎情報と和了役・流局理由集計
 */
"use strict";

class AnaLog extends require('../').base {

    init() {
        this._result = {
            n_game:     0,  // 総対局数
            n_ju:       0,  // 総局数
            n_hule:     0,  // 総和了数
            n_pingju:   0,  // 総流局数
            n_bao:      0,  // 総放縦数
            n_lizhi:    0,  // 総リーチ数
            n_fulou:    0,  // 総副露数
            sum_defen:  0,  // 総打点
            hule:       {}, // 和了役統計
            pingju:     {}, // 流局理由統計
        };
    }
    kaiju(paipu) {
        this._result.n_game++;      // 総対局数を加算
        if (this.viewpoint != null) {   // viewpointの指定がある場合

            /* viewpointに対する順位の統計を取る */
            if (! this._result.n_rank) this._result.n_rank = [ 0, 0, 0, 0 ];
            this._result.n_rank[paipu.rank[this.viewpoint] - 1]++;

            /* viewpointに対する総ポイントを集計する */
            if (! this._result.sum_point) this._result.sum_point = 0;
            this._result.sum_point += + paipu.point[this.viewpoint];
        }
    }
    qipai(qipai) {
        this._result.n_ju++;        // 総局数を加算
        this._fulou = [0,0,0,0];    // 対局者ごとの副露有無を初期化
    }
    dapai(dapai) {
        if (! this.watch(dapai.l)) return;      // 集計対象外なら処理しない
        if (dapai.p.substr(-1) == '*')          // リーチ宣言の場合
                        this._result.n_lizhi++; // 総リーチ数を加算
    }
    fulou(fulou) {
        if (! this.watch(fulou.l)) return;      // 集計対象外なら処理しない
        this._fulou[fulou.l] = 1;               // その対局者の副露を有にする
    }
    hule(hule) {
        if (! this.watch(hule.l)) return;       // 集計対象外なら処理しない
        this._result.n_hule++;                  // 総和了数を加算
        this._result.sum_defen += hule.defen;   // 総打点を加算
        for (let hupai of hule.hupai) {         // 和了役を集計する
            let name = hupai.name.match(/^(?:場風|自風|翻牌|役牌)/)
                            ? '翻牌' : hupai.name;
                                    // 場風、自風、翻牌、役牌 → 翻牌 に名称統一
            /* 和了役を集計する。ドラは枚数でカウントする。*/
            this._result.hule[name] = this._result.hule[name] || 0;
            this._result.hule[name] += name.match(/^(?:赤|裏)?ドラ$/)
                                            ? hupai.fanshu : 1;
        }
    }
    pingju(pingju) {
        this._result.n_pingju++;    // 総流局数を加算
        /* 流局理由を集計する */
        this._result.pingju[pingju.name] = this._result.pingju[pingju.name] || 0;
        this._result.pingju[pingju.name]++;
    }
    last(log) {     // 局終了時の集計
        this._result.n_fulou += this._fulou.reduce((x,y)=> x + y);
                                                // 総副露数を加算する
        /* ダブロンを二重カウントしないよう局終了時に一度だけ処理する */
        const last = log[log.length - 1];
        if (! last.hule || ! this.watch(last.hule.baojia)) return;
                                        // 放縦者が集計対象外なら処理しない
        if (last.hule && last.hule.baojia != null) this._result.n_bao++;
                                                // 総放縦数を加算する
    }
}

/* コマンドパラメータを処理する */
const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 <log-dir>...')
    .option('recursive', { alias: 'r', boolean: true })
    .option('times',     { alias: 't' })
    .option('viewpoint', { alias: 'v' })
    .option('player',    { alias: 'p' })
    .option('silent',    { alias: 's', boolean: true })
    .demandCommand(1)
    .argv;
const filename = argv._;

/* 牌譜解析実行 */
const r = AnaLog.analyze(filename, argv)._result;

/*  結果表示は歴史的理由により過去のツールと互換性を取っている。
    互換性に意味のない方は自由に改変してください  */
if (argv.player) {

    function round(n, r) {
        n = '' + n;
        if (! n.match(/\./)) return n;
        if (r == 0) return n.replace(/\..*$/,'');
        for (let i = 0; i < r; i++) { n += '0' }
        const regex = new RegExp(`(\\\.\\d{${r}}).*$`);
        return n.replace(/^0\./,'.').replace(regex, '$1');
    }

    if (! argv.silent) console.log(r);

    console.log(argv.player);
    console.log('対局数: ' + r.n_game + ' (' + r.n_rank.join(' + ') + ')');
    console.log(
        '平均順位: '   + round([1,2,3,4].map(x=>r.n_rank[x-1]*x)
                                      .reduce((x,y)=>x + y)
                                / r.n_game, 2) + '、'
        + 'トップ率: ' + round(r.n_rank[0] / r.n_game, 3) + '、'
        + '連対率: '   + round((r.n_rank[0] + r.n_rank[1]) / r.n_game, 3) + '、'
        + 'ラス率: '   + round(r.n_rank[3] / r.n_game, 3)
    );
    console.log(
          '和了率: '   + round(r.n_hule / r.n_ju, 3) + '、'
        + '放銃率: '   + round(r.n_bao / r.n_ju, 3) + '、'
        + '立直率: '   + round(r.n_lizhi / r.n_ju, 3) + '、'
        + '副露率: '   + round(r.n_fulou / r.n_ju, 3) + '、'
        + '平均打点: ' + round(r.sum_defen / r.n_hule, 0)
    );
}
else if (argv.viewpoint != null) {

    console.log(
        '========',
        r.n_game,
        r.n_ju,
        r.n_rank.map(n => Math.round(n / r.n_game * 1000) / 1000),
        Math.round((r.n_rank[0]*1 + r.n_rank[1]*2
                    + r.n_rank[2]*3 + r.n_rank[3]*4)
                                                / r.n_game * 100) /100,
        Math.round(r.sum_point / r.n_game * 10) / 10,
        '==',
        Math.round(r.n_hule    / r.n_ju * 1000) / 1000,
        Math.round(r.n_bao     / r.n_ju * 1000) / 1000,
        Math.round(r.n_lizhi   / r.n_ju * 1000) / 1000,
        Math.round(r.n_fulou   / r.n_ju * 1000) / 1000,
        Math.round(r.sum_defen / r.n_hule),
        '==',
        r.n_hule, r.hule,
        '==',
        r.n_pingju,
        Math.round(r.n_pingju / r.n_ju * 1000) / 1000,
        r.pingju
    );
}
else {
    console.log(r);
}
