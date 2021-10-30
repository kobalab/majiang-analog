# majiang-analog

電脳麻将牌譜解析ツール

電脳麻将形式の牌譜を解析する基底クラスを提供します。本クラスのサブクラスを作成し、解析のためのプログラムを書くことができます。

天鳳の牌譜も [tenhou-log](https://www.npmjs.com/package/@kobalab/tenhou-log) で電脳麻将形式に変換し、[解析する](https://blog.kobalab.net/entry/20180113/1515776231)ことが可能です。

**現在はβ版のリリースです。正式版までにインタフェースを変更する可能性があります。**

## インストール
```sh
$ npm i @kobalab/majiang-analog
```

## 使用例

majiang-analog の提供するクラスのサブクラスを作成し、メソッドをオーバーライドして解析処理を記述します。
```js
class AnaLog extends require('@kobalab/majiang-analog').analog {

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
this._model には [卓情報](https://github.com/kobalab/majiang-core/wiki/%E5%8D%93%E6%83%85%E5%A0%B1) が設定されてます。

|  契機      |  メソッド            |
|:----------|:----------------------|
| 解析開始   | init()               |
| 対戦開始   | kaiju(_paipu_)       |
| 配牌       | qipai(_qipai_)       |
| 自摸       | zimo(_zimo_)         |
| 打牌       | dapai(_dapai_)       |
| 副露       | fulou(_fulou_)       |
| 暗槓・加槓  | gang(_gang_)        |
| 槓自摸     | gangzimo(_gangzimo_) |
| 開槓       | kaigang(_kaigang_)   |
| 和了       | hule(_hule_)         |
| 流局       | pingju(_pingju_)     |

配牌時には qipai(_qipai_) がパラメータ _qipai_ に [牌譜#配牌](https://github.com/kobalab/majiang-core/wiki/%E7%89%8C%E8%AD%9C#%E9%85%8D%E7%89%8C-qipai) を設定して呼び出されます。場風は _qipai_.zhuangfeng に設定されています。各プレーヤーの配牌は _qipai_.shoupai に設定されます。

**static** analyze(_filename_) を呼び出すと解析を開始します。_filename_ は解析対象のファイル名、もしくは牌譜のあるディレクトリ名です。省略時にはカレントディレクトリが指定されたと解釈します。

## ライセンス
[MIT](https://github.com/kobalab/majiang-analog/blob/master/LICENSE)

## 作者
[Satoshi Kobayashi](https://github.com/kobalab)
