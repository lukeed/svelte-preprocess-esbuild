import { readFile, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import * as esbuild from 'esbuild';
import { promisify } from 'util';

const read = promisify(readFile);

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

type Attributes = Record<string, string | boolean>;

// ---

let decided = false;
let service: Service | null;

function isWatcher(): boolean {
	const { ROLLUP_WATCH, WEBPACK_DEV_SERVER, CI, NODE_ENV } = process.env;

	if (CI != null) return false;
	if (ROLLUP_WATCH || WEBPACK_DEV_SERVER) return true;
	return !/^(prod|test)/.test(NODE_ENV) && /^(dev|local)/.test(NODE_ENV);
}

async function decide() {
	decided = true;
	if (isWatcher()) {
		service = await esbuild.startService();
	}
}

const isExternal = /^(https?:)?\/\//;
const isString = (x: unknown): x is string => typeof x === 'string';
const IMPORTS = /import(?![\n\r\s\t]+type)(?:["'\s]*([\w*{}\n,\r\s\t]+)from\s*)?["'\s].*([@\w/_-]+)["'\s].*/g;

function isTypescript(attrs: Attributes): boolean | void {
	if (isString(attrs.lang)) return /^(ts|typescript)$/.test(attrs.lang);
	if (isString(attrs.type)) return /^(text|application)[/](ts|typescript)$/.test(attrs.type);
	if (isString(attrs.src) && !isExternal.test(attrs.src)) return /\.ts$/.test(attrs.src);
}

function bail(err: Error, ...args: (string|number)[]): never {
	console.error('[esbuild]', ...args);
	console.error(err.stack || err);
	process.exit(1);
}

async function transform(input: ProcessorInput, options: TransformOptions): Promise<Processed> {
	let config = options;
	let deps: string[] = [];

	if (input.filename) {
		let src = input.attributes.src;
		config = { ...config, sourcefile: input.filename };

		if (isString(src) && !isExternal.test(src)) {
			src = resolve(dirname(input.filename), src);
			if (existsSync(src)) {
				input.content = await read(src, 'utf8');
				deps.push(src);
			} else {
				console.warn('[esbuild] Could not find "%s" file', src);
			}
		}
	}

	let imports = input.content.match(IMPORTS);
	let preprend = Array.isArray(imports) ? (imports.join('\n')+'\n') : '';
	let output = await (service || esbuild).transform(input.content, config);

	// TODO: format output.warnings
	if (output.warnings.length > 0) {
		console.log(output.warnings);
	}

	return {
		code: preprend + output.code.replace(IMPORTS, ''),
		dependencies: deps,
		map: output.map,
	};
}

/** @note Use `options.define` for replacements */
export function typescript(options: Partial<Options> = {}): PreprocessorGroup {
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

	const define = config.define;

	return {
		async script(input) {
			decided || await decide();

			let bool = !!isTypescript(input.attributes);
			if (!bool && !!define) return transform(input, { define, loader: 'js' });
			if (!bool) return { code: input.content };

			return transform(input, config);
		}
	};
}

/** @important Only works with JavaScript! */
export function replace(define: Definitions = {}): PreprocessorGroup {
	for (let key in define) {
		define[key] = String(define[key]);
	}

	return {
		async script(input) {
			decided || await decide();

			let bool = !!isTypescript(input.attributes);
			if (bool) return { code: input.content };

			return transform(input, { define, loader: 'js' });
		}
	};
}
