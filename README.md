[![npm](https://nodei.co/npm/file-pager.png)](https://npmjs.com/package/file-pager)

# file-pager

[![Build Status][travis-badge]][travis] [![Dependency Status][david-badge]][david]

Pipe to `$PAGER` by creating a temporary file first.

[travis]: https://travis-ci.org/eush77/file-pager
[travis-badge]: https://travis-ci.org/eush77/file-pager.svg
[david]: https://david-dm.org/eush77/file-pager
[david-badge]: https://david-dm.org/eush77/file-pager.png

## Why

Some pagers can determine the proper highlighting mode from file extension. Your favorite pager probably can.

## Usage

```js
var pager = require('file-pager');
var fs = require('fs');

fs.createReadStream(require.resolve('file-pager'))
  .pipe(pager({ ext: 'js' }), function () {
    console.log('Done.');
  });
```

`npm run example` to open source file for this module with syntax highlighting (if your pager supports it and is configured correctly).

## API

### `pager = require('file-pager')`

### `pager(opts, [done(err)])`

Returns a writable stream.

#### `done(err)`

Callback invoked when pager is terminated.

`opts` can specify temporary file name with different levels of granularity.

#### `opts.path`

Path to file. This is the only case in which file won't be removed after pager is closed.

`stream.pipe(pager({ path: '/file' }))` is effectively `tee /file | $PAGER`.

#### `opts.basename`

Base name (last component) to create temporary file with.

#### `opts.ext`

File extension to create temporary file with.

## Related

- [`default-pager`][default-pager] if you don't need temporary file mediator.

[default-pager]: https://npm.im/default-pager

## Install

```
npm install file-pager
```

## License

MIT
