#!/usr/bin/env node
'use strict';
var pager = require('..');
var fs = require('fs');


fs.createReadStream(require.resolve('..'))
  .pipe(pager({ ext: 'js' }), function (err) {
    if (err) return console.error(err.toString());
    console.log('Done.');
  });
