/*!
 *  @kobalab/majiang-analog
 *
 *  Copyright(C) 2021 Satoshi Kobayashi
 *  Released under the MIT license
 *  https://github.com/kobalab/majiang-analog/blob/master/LICENSE
 */
"use strict";

const AnaLog = require('./analog');

AnaLog.base    = require('./base');
AnaLog.getlogs = require('./getlogs');

module.exports = AnaLog;
