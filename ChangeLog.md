## v1.2.0 / 2024-11-27

  - 牌譜の指定に配列と再帰を使用できるよう修正
    - getlogs() の引数を上記に変更
    - examples の script も上記に従うよう修正
  - examples を追加
    - highest_records.js - 最高記録(最大局数、最長の手牌、最長の河など)
  - パッケージを最新化
    - @kobalab/majiang-core 1.3.0 → 1.3.1
    - mocha 10.7.3 → 10.8.2
  - 脆弱性警告に対処
    - cross-spawn 7.0.3 → 7.0.6

## v1.1.0 / 2024-10-20

  - @kobalab/majiang-core 1.1.1 → 1.3.0
  - メソッド last() 呼び出し前に卓情報を最終化する処理を追加
  - examples を追加
    - validate.js - 牌譜の正当性チェック
  - パッケージを最新化
    - mocha 9.2.0 → 10.7.3
    - nyc 15.1.0 → 17.1.0
    - yargs 17.2.1 → 17.7.2
  - 脆弱性警告に対処
    - braces 3.0.2 → 3.0.3

### v1.0.1 / 2023-12-19

  - @kobalab/majiang-core 1.0.0 → 1.1.1
  - 脆弱性警告に対応
    - @babel/traverse 7.15.4 → 7.23.6
    - json5 2.2.0 → 2.2.3
    - semver 6.3.0 → 6.3.1

# v1.0.0 / 2022-11-11

  - 正式版リリース
  - @kobalab/majiang-core 0.3.1 → 1.0.0

### v0.4.7 / 2022-10-27

  - 九蓮宝燈形の和了形の考慮が漏れていたバグを修正(再)
  - @kobalab/majiang-core 0.2.11 → 0.3.1
  - 脆弱性警告に対応(minimatch 3.0.4 → 3.1.2)

### v0.4.6 / 2022-09-15

  - 九蓮宝燈形の和了形の考慮が漏れていたバグを修正
  - @kobalab/majiang-core 0.2.4 → 0.2.11
  - 脆弱性警告に対処(minimist 1.2.5 → 1.2.6)

### v0.4.5 / 2022-03-19

  - examples を追加
    - double_lizhi.js - ダブルリーチの好形率・和了率・平均打点
  - @kobalab/majiang-core 0.2.1 → 0.2.4

### v0.4.4 / 2022-01-24

  - examples を追加
    - examples/diff-strict.js を追加  - 2つの牌譜から厳密に差分を抽出する
  - @kobalab/majiang-core 0.1.3 → 0.2.1
  - 脆弱性警告に対処(mocha 9.1.3 → 9.2.0)

### v0.4.3 / 2021-12-09

  - examples を追加
    - dist_lizhi.js  - リーチ宣言牌および最初に切った数牌と同種の牌の危険度
  - @kobalab/majiang-core 0.1.2 → 0.1.3

### v0.4.2 / 2021-11-19

  - examples を追加
    - trap_lizhi.js  - モロ引っ掛けの危険度
  - @kobalab/majiang-core 0.0.4 → 0.1.2

### v0.4.1 / 2021-11-12

  - READMEの誤記修正

## v0.4.0 / 2021-11-08

  - インタフェースを変更
    - require() の呼び出しがクラスを返すよう修正

### v0.3.2 / 2021-11-07

  - examples を追加
    - dist_pai.js  - 局終了時の牌の分布
    - dist_hulepai.js  - 和了牌の分布
    - fulou.js  - 巡目ごとの副露数・副露時向聴数
    - hule_pattern.js  - リーチに対する待ちの形ごとの危険度

### v0.3.1 / 2021-11-04

  - README のリンク切れを修正

## v0.3.0 / 2021-11-03

  - インタフェース変更
    - _model → board
    - .viewpoint() → .watch()
    - ._basename → .basename
    - ._viewpoint → .viewpoint
  - examples を追加
    - after_lizhi.js  - 先制リーチを受けた局の結果と収支
    - diff.js  - 2つの牌譜から差分を抽出する

## v0.2.0 / 2021-10-31

  - インタフェースを変更
     - this._result を廃止
     - 親クラスのメソッド呼び出しを不要にした
  - examples に xiangting.js を追加

## v0.1.0 / 2021-10-30

  - βリリース
