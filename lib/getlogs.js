/*
 *  getlogs
 */
"use strict";

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

function* get_logs_in_file(filename) {

    let basename, list;
    if (filename.match(/\.json$/)) {
        basename = path.basename(filename);
        list = JSON.parse(fs.readFileSync(filename));
    }
    else if (filename.match(/\.json\.gz$/)) {
        basename = path.basename(filename, '.gz');
        list = JSON.parse(zlib.gunzipSync(
                          fs.readFileSync(filename)).toString());
    }
    else return;

    let n = 0;
    for (let paipu of [].concat(list)) {
        yield { basename: `${basename}#${n++}`, paipu: paipu };
    }
}

function* get_files_in_dir(dirname, recursive) {
    for (let filename of fs.readdirSync(dirname).sort()) {
        let fullname = path.join(dirname, filename);
        if (recursive && fs.statSync(fullname).isDirectory())
                yield* get_files_in_dir(fullname, recursive);
        else    yield* get_logs_in_file(fullname);
    }
}

function* getlogs(files, recursive) {
    if (! Array.isArray(files)) files = [ files ];
    for (let filename of files) {
        if (fs.statSync(filename).isDirectory())
                yield* get_files_in_dir(filename, recursive);
        else    yield* get_logs_in_file(filename);
    }
}

module.exports = getlogs;
