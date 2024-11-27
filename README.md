# majiang-analog

電脳麻将牌譜解析ツール

[電脳麻将](https://github.com/kobalab/Majiang)形式の[牌譜](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C)を解析する基底クラスを提供します。本クラスのサブクラスを作成し、解析のためのプログラムを書くことができます。

天鳳の牌譜も [tenhou-log](https://www.npmjs.com/package/@kobalab/tenhou-log) で電脳麻将形式に変換し、[解析する](https://blog.kobalab.net/entry/20180113/1515776231)ことが可能です。

## インストール
```sh
$ npm i @kobalab/majiang-analog
```

## 使用例

majiang-analog の提供するクラスのサブクラスを作成し、メソッドをオーバーライドして解析処理を記述します。
```js
class AnaLog extends require('@kobalab/majiang-analog') {

    /* 和了時に呼び出されるメソッドをオーバーライドして解析処理を書く */
    hule(hule) {
        if (hule.hupai.find(h=> h.name == '大三元')) {   // 大三元で和了した場合
            console.log(this.idx(hule.l));  // ログにどの牌譜か出力する
        }
    }
}

AnaLog.analyze();     // 解析を実行する
```
[examples](https://github.com/kobalab/majiang-analog/tree/master/examples) にも解析プログラムの例がありますので、参考にしてください。

## メソッド
牌譜の各段階で以下のメソッドが呼び出されます。メソッドのパラメータはそれぞれに対応する [牌譜](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C) の情報です。
this.board には [卓情報](https://github.com/kobalab/majiang-core/wiki/%E5%8D%93%E6%83%85%E5%A0%B1) が設定されます。

|  契機        |  メソッド                                                                                                           |
|:-------------|:--------------------------------------------------------------------------------------------------------------------|
| 解析開始     | init()                                                                                                              |
| 対戦開始     | kaiju([_paipu_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E5%85%A8%E4%BD%93))                |
| 配牌         | qipai([_qipai_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E9%85%8D%E7%89%8C))                |
| 自摸         | zimo([_zimo_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E8%87%AA%E6%91%B8))                  |
| 打牌         | dapai([_dapai_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E6%89%93%E7%89%8C))                |
| 副露         | fulou([_fulou_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E5%89%AF%E9%9C%B2))                |
| 暗槓・加槓   | gang([_gang_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E6%A7%93))                           |
| 槓自摸       | gangzimo([_gangzimo_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E6%A7%93%E8%87%AA%E6%91%B8)) |
| 開槓         | kaigang([_kaigang_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E9%96%8B%E6%A7%93))            |
| 和了         | hule([_hule_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E5%92%8C%E4%BA%86))                  |
| 流局         | pingju([_pingju_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E6%B5%81%E5%B1%80))              |
| 和了・流局後 | last([_log_](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E5%B1%80%E6%83%85%E5%A0%B1))          |

例えば、配牌時には qipai(_qipai_) が呼び出され、[_qipai_.shoupai](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#shoupai) には各プレーヤーの配牌が設定されます。

## 起動方法
**static** analyze(_filename_, _argv_) を呼び出すと解析を開始します。
_filename_ は解析対象のファイル名、もしくは牌譜のあるディレクトリ名、あるいはその両方を含む配列です。省略時にはカレントディレクトリが指定されたと解釈します。
_argv_ には以下の動作を変更するオプションが指定できます。

#### recursive
指定した場合、ディレクトリを再帰的に探索して牌譜を探します。

#### times
指定した場合、これを超える数のログを解析しません。

#### silent
解析進捗状況の表示を停止します。

#### viewpoint
指定された値を this.viewpoint に設定します。特定の席順(仮東など)の対局者のみ集計したい場合に利用できます。
this.viewpoint が指定されているとき、メソッド watch(_l_) は手番 _l_ がそれと一致しなければ偽を返します。

#### player
指定された名前と一致する対局者の席順を this.viewpoint に設定します。

## その他の機能
```js
const { base, getlogs } = require("@kobalab/majiang-analog");
```
### base
簡易解析用の基底クラス。
this.board に [卓情報](https://github.com/kobalab/majiang-core/wiki/%E5%8D%93%E6%83%85%E5%A0%B1) を設定しませんが、高速に動作します。

### getlogs
* **filename** - string
* **recursive** - boolean
* _返り値_ - object

**filename** で指定されたファイルもしくはディレクトリ、あるいはそれらを含む配列から [牌譜](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C) を1つずつ取り出すイテレータを返します。
**recursive** に真を設定すると、**filename** 配下を再帰的に探索します。

## ライセンス
[MIT](https://github.com/kobalab/majiang-analog/blob/master/LICENSE)

## 作者
[Satoshi Kobayashi](https://github.com/kobalab)
