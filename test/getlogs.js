const assert = require('assert');
const path   = require('path');

const getlogs = require('../').getlogs;

function get_basename(filename, recursive) {
    process.chdir(__dirname);
    let basename = [];
    for (let log of getlogs(filename, recursive)) {
        basename.push(log.basename);
    }
    return basename;
}

suite('getlogs', ()=>{

    test('モジュールが存在すること', ()=>assert.ok(getlogs));

    test('存在しないファイル名の場合、例外を発生すること', ()=>{
        assert.throws(()=>get_basename('log/badfile.json'));
    });
    test('JSON以外のファイルを処理しないこと', ()=>{
        assert.deepEqual(get_basename('log/badfile.txt'), []);
    });
    test('ファイル内に単一の牌譜', ()=>{
        assert.deepEqual(get_basename('log/single.json'), [
            'single.json#0' ])
    });
    test('ファイル内に複数の牌譜', ()=>{
        assert.deepEqual(get_basename('log/multi.json'), [
            'multi.json#0', 'multi.json#1' ])
    });
    test('gzip圧縮された牌譜', ()=>{
        assert.deepEqual(get_basename('log/compressed.json.gz'), [
            'compressed.json#0' ])
    });
    test('ディレクトリを指定', ()=>{
        assert.deepEqual(get_basename('log'), [
            'compressed.json#0',
            'multi.json#0', 'multi.json#1',
            'single.json#0'
        ])
    });
    test('複数のファイルを指定', ()=>{
        assert.deepEqual(get_basename(['log/multi.json','log/single.json']), [
            'multi.json#0', 'multi.json#1',
            'single.json#0'
        ]);
    });
    test('再帰オプションを指定', ()=>{
        assert.deepEqual(get_basename('log', true), [
            'compressed.json#0',
            'subdir.json#0',
            'multi.json#0', 'multi.json#1',
            'single.json#0'
        ])
    });
});
