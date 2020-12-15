import { resolve } from 'path';
import * as esbuild from 'esbuild';

import type { Service, TransformOptions } from 'esbuild';
import type { PreprocessorGroup, Processed } from 'svelte/types/compiler/preprocess';

export type Definitions = {
	[find: string]: string;
}

type Allow = Pick<TransformOptions, 'avoidTDZ'|'banner'|'charset'|'define'|'footer'|'keepNames'|'pure'|'target'|'treeShaking'|'tsconfigRaw'>;

export interface Options extends Allow {
	/** @default 'tsconfig.json' */
	tsconfig?: string;
	/** @default 'error' */
	loglevel?: TransformOptions['logLevel'];
	/** @default true */
	sourcemap?: boolean | 'inline';
	/** @default {} */
	define?: Definitions;
	/** @default 'utf8' */
	charset?: TransformOptions['charset'];
}

interface ProcessorInput {
	content: string;
	attributes: Record<string, string | boolean>;
	filename?: string;
}

// ---

let decided = false;
let service: Service | null;

function isWatcher(): boolean {
	const { ROLLUP_WATCH, WEBPACK_DEV_SERVER, CI, NODE_ENV } = process.env;

	if (CI != null) return false;
	if (ROLLUP_WATCH || WEBPACK_DEV_SERVER) return true;
	return !/^(prod|test)/.test(NODE_ENV) && /^(dev|local)/.test(NODE_ENV);
}

function bail(err: Error, ...args: (string|number)[]): never {
	console.error('[esbuild]', ...args);
	console.error(err.stack || err);
	process.exit(1);
}

async function transform(input: ProcessorInput, options: TransformOptions): Promise<Processed> {
	let config = { ...options };
	if (input.filename) config.sourcefile = input.filename;
	let output = await (service || esbuild).transform(input.content, config);

	// TODO: log output.warnings
	console.log(output.warnings);

	return {
		code: output.code,
		map: output.map,
	};
}

function esbuilder(config: TransformOptions, typescript = false): PreprocessorGroup {
	const { define } = config;

	return {
		async script(input) {
			if (!decided) {
				decided = true;
				if (isWatcher()) {
					service = await esbuild.startService();
				}
			}

			let { lang } = input.attributes;
			let isTypescript = (lang === 'ts' || lang === 'typescript');
			if (!isTypescript && define) return transform(input, { define, loader: 'js' });
			if (isTypescript !== typescript) return { code: input.content };

			return transform(input, config);
		}
	};
}

/** @note Use `options.define` for replacements */
export function typescript(options: Options = {}): PreprocessorGroup {
	let { tsconfig, loglevel='error', ...config } = options as Options & TransformOptions;

	config = {
		charset: 'utf8',
		logLevel: loglevel,
		sourcemap: true,
		...config,
		loader: 'ts',
		format: 'esm',
		minify: false,
		errorLimit: 0,
	};

	if (config.tsconfigRaw) {
		// do nothing
	} else {
		let contents: Record<string, any>;
		let file = resolve(tsconfig || 'tsconfig.json');
		try {
			contents = require(file);
		} catch (err) {
			if (err.code !== 'MODULE_NOT_FOUND') {
				return bail(err, 'Error while parsing "tsconfig" file:', file);
			}
			if (tsconfig) {
				return bail(err, 'Unable to load `tsconfig` file:', file);
			}
			console.warn('[esbuild] Attempted to autoload "tsconfig.json" – failed!');
			contents = { extends: true };
		}

		if (contents.compilerOptions) {
			config.tsconfigRaw = { compilerOptions: contents.compilerOptions };
		} else if (!contents.extends) {
			console.warn('[esbuild] Missing `compilerOptions` configuration – skip!');
		}
	}

	return esbuilder(config, true);
}

/** @important Only works with JavaScript! */
export function replace(dict: Definitions = {}): PreprocessorGroup {
	for (let key in dict) {
		dict[key] = String(dict[key]);
	}

	return esbuilder({ define: dict, loader: 'js' });
}
