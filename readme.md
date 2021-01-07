# svelte-preprocess-esbuild [![CI](https://github.com/lukeed/svelte-preprocess-esbuild/workflows/CI/badge.svg)](https://github.com/lukeed/svelte-preprocess-esbuild/actions) [![codecov](https://badgen.net/codecov/c/github/lukeed/svelte-preprocess-esbuild)](https://codecov.io/gh/lukeed/svelte-preprocess-esbuild)

> A Svelte Preprocessor to compile TypeScript via [`esbuild`](https://github.com/evanw/esbuild)!


## Install

```
$ npm install svelte-preprocess-esbuild esbuild --save-dev
```

> **Note:** `esbuild` is a peer dependency!


## Usage

You can use `svelte-preprocess-esbuild` alongside `svelte-preprocess`!

***Example:*** `rollup.config.js`

An example `rollup.config.js`, that uses this plugin alongside [`svelte-preprocess`](https://github.com/sveltejs/svelte-preprocess).

> **Important:** When using `svelte-preprocess` (autopreprocessor), you must pass `false` to its `typescript` option. Otherwise, your TypeScript `<script>`s will be compiled twice!

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

## API

### typescript(options?)
Returns: `PreprocessorGroup`

Invoke `esbuild` on all `<script>` tags within your template that match any of the following:

* a `lang="ts"` attribute
* a `lang="typescript"` attribute
* a `type="application/typescript"` attribute
* a `type="text/typescript"` attribute
* a `type="application/ts"` attribute
* a `type="text/ts"` attribute
* a non-external `src=""` attribute that ends with `.ts` extension

Additionally, whenever `options.define` is given a value, **all** `<script>` tags will be subject to [replacements](https://esbuild.github.io/api/#define), _including non-TypeScript contents!_

#### options
Type: `Object`<br>
Required: `false`

A limited subset of [`esbuild.TransformOptions`](https://github.com/evanw/esbuild/blob/master/lib/types.ts#L126) is supported. These values are forced (for compatbility and/or reliability): `minify`, `loader`, `format`, and `errorLimit`.

Please see the exported [`Options` interface](https://github.com/lukeed/svelte-preprocess-esbuild/blob/master/src/index.ts#L17) for the full detail.

Below is the _only_ option that this plugin adds:

#### options.tsconfig
Type: `string`<br>
Default: `tsconfig.json`

Load a TypeScript configuration file. When found, is passed to `esbuild` as its `tsconfigRaw` option.

When a value is given, an error will be thrown if the file cannot be found and/or parsed correctly.

By default, attempts to autoload `tsconfig.json`, but _will not_ throw if it's missing.


### replace(dict)
Returns: `PreprocessorGroup`

Invoke `esbuild` on all non-TypeScript `<script>`s, applying any static [string replacements](https://esbuild.github.io/api/#define).

> **Note:** This preprocessor will **ignore** TypeScript contents! <br>If you are using any TypeScript at all, you should be using the [`typescript` preprocessor](#typescriptoptions) with `options.define` instead.

#### dict
Type: `Object`

Your dictionary of key-value replacement pairs, where keys are replaced by their values.

> **Important:** All values ***must*** be stringified!

```js
// rollup.config.js
import svelte from 'rollup-plugin-svelte';
import { replace } from 'svelte-preprocess-esbuild';

export default {
  // ...
  plugins: [
    // ...
    svelte({
      preprocess: [
        replace({
          'process.browser': JSON.stringify(true),
          'process.env.BASEURL': JSON.stringify('https://foobar.com/'),
        })
      ]
    })
  ]
}
```

## License

MIT © [Luke Edwards](https://lukeed.com)
