'use strict';

var rewire = require('rewire');

var pager = rewire('..'),
    spawnCtrl = require('./lib/spawn-control');

var test = require('tape'),
    Test = test.Test;

var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    events = require('events');


Test.prototype.captureTmpDir = function () {
  this.tmpDir = fs.readdirSync(os.tmpdir());
};

Test.prototype.tmpDirNotChanged = function () {
  this.deepEqual(fs.readdirSync(os.tmpdir()), this.tmpDir);
};


test('opts', function (t) {
  t.throws(pager.bind(null, { path: '/path/to/file', ext: 'js' }), /exclusive/);
  t.throws(pager.bind(null, { basename: 'file.js', ext: 'cc' }), /exclusive/);
  t.end();
});


test('opts.path', function (t) {
  t.plan(9);
  t.captureTmpDir();

  process.env.PAGER = 'true';
  var file = __dirname + '/file';
  var spawnCount = 0;

  var spawn = spawnCtrl().on('spawn', function (cmd) {
    t.deepEqual(cmd, ['true', file]);
    spawnCount += 1;
  });

  pager.__set__('spawn', spawn);
  pager({ path: file }, next).end('data-1');

  function next (err) {
    t.ifErr(err);
    t.equal(fs.readFileSync(file, 'utf8'), 'data-1');
    pager({ path: file }, last).end('data-2');
  }

  function last (err) {
    t.ifErr(err);
    t.equal(fs.readFileSync(file, 'utf8'), 'data-2');
    fs.unlink(file, t.ifErr.bind(t));
    finalize();
  }

  function finalize () {
    t.equal(spawnCount, 2);
    t.tmpDirNotChanged();
  }
});


test('opts.basename', function (t) {
  t.plan(6);
  t.captureTmpDir();

  process.env.PAGER = 'true';
  var basename = fs.readdirSync(os.tmpdir())[0] || 'foo';
  var oldFile = path.join(os.tmpdir(), basename);
  var modified = fs.statSync(oldFile).mtime;

  var spawn = spawnCtrl()
        .on('inactive-spawn', t.fail.bind(t, 'inactive spawn'))
        .once('spawn', function (cmd) {
          t.equal(cmd[0], 'true');
          t.equal(path.basename(cmd[1]), basename);
          t.equal(fs.readFileSync(cmd[1], 'utf8'), 'data');
        });

  pager.__set__('spawn', spawn);
  pager({ basename: basename }, done).end('data');

  function done (err) {
    t.ifErr(err);
    t.equal(+fs.statSync(oldFile).mtime, +modified);
    t.tmpDirNotChanged();
  }
});


test('opts.ext', function (t) {
  t.plan(9);
  t.captureTmpDir();

  process.env.PAGER = 'true';
  var time = 0;

  var spawn = spawnCtrl()
        .on('spawn', function (cmd) {
          t.equal(cmd[0], 'true');
          t.equal(path.extname(cmd[1]), '.js');
          t.equal(fs.readFileSync(cmd[1], 'utf8'), 'data');
          time += 1;
        });

  pager.__set__('spawn', spawn);
  pager({ ext: 'js' }, done).end('data');
  pager({ ext: '.js' }, done).end('data');

  function done (err) {
    t.ifErr(err);
    if (++time == 4) {
      t.tmpDirNotChanged();
    }
  }
});
