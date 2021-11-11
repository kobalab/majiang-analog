### v0.4.1 / 2021-11-12

  - READMEの誤記修正

### v0.4.0 / 2021-11-08

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
