'use strict';

var rimraf = require('rimraf'),
    through = require('through2');

var spawn = require('child_process').spawn,
    path = require('path'),
    os = require('os'),
    fs = require('fs');


module.exports = function (opts, cb) {
  opts = opts || {};
  cb = cb || function (err) {
    if (err) throw err;
  };

  if (!!opts.path + !!opts.basename + !!opts.ext != 1) {
    throw Error(
      (opts.path || opts.basename || opts.ext
       ? 'opts.path, opts.basename, and opts.ext are mutually exclusive.'
       : 'One of opts.path, opts.basename, opts.ext is required.')
    );
  }

  var pager = process.env.PAGER || 'more';
  var pathComponent = ['path', 'basename', 'ext'].filter(function (key) {
    return opts[key];
  })[0];

  var stream = through();

  tmpFileFrom[pathComponent](opts[pathComponent], function (err, file) {
    if (err) return cb(err);

    var sink = fs.createWriteStream(file.path);
    stream.pipe(sink);

    sink.on('finish', function () {
      spawn(pager, [file.path], { stdio: 'inherit' })
        .on('exit', function (code, signal) {
          file.delete(function (err) {
            if (code !== 0) {
              return cb(Error(pager + ' exited with ' + (
                signal || 'code ' + code
              )));
            }
            if (err) {
              return cb(err);
            }

            cb(null);
          });
        });
    });
  });

  return stream;
};


var tmpFileFrom = {};


tmpFileFrom['path'] = function (path, cb) {
  cb(null, {
    path: path,
    delete: function (cb) { cb() }
  });
};


tmpFileFrom['basename'] = function (basename, cb) {
  var tmpdir = tmpFilePath();
  fs.mkdir(tmpdir, function (err) {
    if (err) return cb(err);
    cb(null, {
      path: path.join(tmpdir, basename),
      delete: rimraf.bind(null, tmpdir)
    });
  });
};


tmpFileFrom['ext'] = function (ext, cb) {
  if (ext[0] != '.') {
    ext = '.' + ext;
  }

  cb(null, {
    path: tmpFilePath() + ext,
    delete: function (cb) {
      fs.unlink(this.path, cb);
    }
  });
};


function tmpFilePath () {
  return path.join(os.tmpdir(), String(Date.now()));
}
