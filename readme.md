# svelte-preprocess-esbuild [![CI](https://github.com/lukeed/svelte-preprocess-esbuild/workflows/CI/badge.svg)](https://github.com/lukeed/svelte-preprocess-esbuild/actions) [![codecov](https://badgen.net/codecov/c/github/lukeed/svelte-preprocess-esbuild)](https://codecov.io/gh/lukeed/svelte-preprocess-esbuild)

> A Svelte Preprocessor to compile TypeScript via [`esbuild`](https://github.com/evanw/esbuild)!


## Install

```
$ npm install svelte-preprocess-esbuild esbuild --save-dev
```

> **Note:** `esbuild` is a peer dependency!


## Usage

> You can use `svelte-preprocess-esbuild` anywhere you use `svelte-preprocess`!

***Example:*** `rollup.config.js`

An example `rollup.config.js`, that uses this plugin alongside [`svelte-preprocess`](https://github.com/sveltejs/svelte-preprocess).

> **Important:** When using `svelte-preprocess` (autoprecessor), you must pass `false` to its `typescript` option. Otherwise, your TypeScript `<script>`s will be compiled twice!

Please note that this is _not_ a complete Rollup configuration! <br>Refer to [`rollup-plugin-svelte`](https://github.com/sveltejs/rollup-plugin-svelte) for more documentation.

```js
// rollup.config.js
import svelte from 'rollup-plugin-svelte';
import { typescript } from 'svelte-preprocess-esbuild';
import preprocess from 'svelte-preprocess';

export default {
  // ...
  plugins: [
    // ...
    svelte({
      preprocess: [
        typescript({
          target: 'es2020',
          define: {
            'process.browser': 'true'
          }
        }),
        // avoid double compile
        preprocess({ typescript: false }),
      ],
      compilerOptions: {
        // ...
      }
    })
  ]
}
```

***Example:*** `svelte.config.js`

```js
// svelte.config.js
const { typescript } = require('svelte-preprocess-esbuild');
const preprocess = require('svelte-preprocess');

module.exports = {
  preprocess: [
    typescript({
      // ...
    }),
    preprocess({
      // avoid double
      typescript: false
    })
  ],
  compilerOptions: {
    //
  }
}
```

## Options

A limited subset of [`esbuild.TransformOptions`](https://github.com/evanw/esbuild/blob/master/lib/types.ts#L126) is supported. These values are forced (for compatbility and/or reliability): `minify`, `loader`, `format`, and `errorLimit`.

Please see the exported [`Options` interface](https://github.com/lukeed/svelte-preprocess-esbuild/blob/master/src/index.ts#L17) for the full detail.

Below is the _only_ option that this plugin adds:

#### options.tsconfig
Type: `string`<br>
Required: `tsconfig.json`

Load a TypeScript configuration file. When found, is passed to `esbuild` as its `tsconfigRaw` option.

When a value is given, an error will be thrown if the file cannot be found and/or parsed correctly.

By default, attempts to autoload `tsconfig.json`, but _will not_ throw if it's missing.


## License

MIT © [Luke Edwards](https://lukeed.com)
