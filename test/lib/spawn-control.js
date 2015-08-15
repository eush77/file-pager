'use strict';

var assign = require('object.assign');

var events = require('events');


module.exports = function (code, signal) {
  if (signal == null) {
    code = code || 0;
  }

  var spawn = function spawn (cmdName, args) {
    var cmd = [cmdName].concat(args);
    var event = spawn.listeners('spawn').length ? 'spawn' : 'inactive-spawn';
    spawn.emit(event, cmd);
    var ee = new events;
    process.nextTick(ee.emit.bind(ee, 'exit', code, signal));
    return ee;
  };

  assign(spawn, events.prototype);
  events.call(spawn);

  return spawn;
};
