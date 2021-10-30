# majiang-analog

電脳麻将牌譜解析ツール

電脳麻将形式の牌譜を解析する基底クラスを提供します。本クラスのサブクラスを作成し、解析のためのプログラムを書くことができます。

天鳳の牌譜も [tenhou-log](https://www.npmjs.com/package/@kobalab/tenhou-log) で電脳麻将形式に変換し、[解析する](https://blog.kobalab.net/entry/20180113/1515776231)ことが可能です。

## インストール
```sh
$ npm i @kobalab/majiang-analog
```

## 使用法
```js
class AnaLog extends require('@kobalab/majiang-analog').analog {

    /* ここに解析プログラムを書く */
}

AnaLog.analyze();     // 解析を実行する
```

[examples](https://github.com/kobalab/majiang-analog/tree/master/examples) にも解析プログラムの例がありますので、参考にしてください。

## ライセンス
[MIT](https://github.com/kobalab/majiang-analog/blob/master/LICENSE)

## 作者
[Satoshi Kobayashi](https://github.com/kobalab)
