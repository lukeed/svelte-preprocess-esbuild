import { resolve } from 'path';
import { startService } from 'esbuild';

/** @type {import('esbuild').Service} */let service;
let boot = startService().then(x => { service = x });

/**
 * @typedef Config
 * @type {import('esbuild').TransformOptions}
 */

/** @returns {never} */
function bail(err, ...args) {
	console.error('[esbuild]', ...args);
	console.error(err.stack || err);
	process.exit(1);
}

/**
 * @param {Config} config
 * @returns {import('svelte/types/compiler/preprocess').PreprocessorGroup}
 */
function esbuilder(config, isTypescript = false) {
	return {
		async script(input) {
			if (!service) await boot;

			let { lang } = input.attributes;
			let bool = (lang === 'ts' || lang === 'typescript');
			if (bool !== isTypescript) return { code: input.content };

			let sourcefile = input.filename;
			let output = await service.transform(input.content, { ...config, sourcefile });

			// TODO: log output.warnings

			return {
				code: output.code,
				map: output.map,
			};
		}
	};
}

/**
 * @param {Config & { loglevel?: import('esbuild').LogLevel, tsconfig?: string }} [options]
 */
export function typescript(options={}) {
	let { tsconfig, loglevel='error', ...config } = options;

	config = {
		format: 'esm',
		charset: 'utf8',
		logLevel: loglevel,
		sourcemap: true,
		...config,
		loader: 'ts',
		minify: false,
		errorLimit: 0,
	};

	if (config.tsconfigRaw) {
		// do nothing
	} else {
		let contents;
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
		}

		if (contents.compilerOptions) {
			config.tsconfigRaw = { compilerOptions: contents.compilerOptions };
			if (contents.compilerOptions.module === 'commonjs') config.format = 'cjs';
		} else {
			console.warn('[esbuild] Missing `compilerOptions` configuration – skip!');
		}
	}

	return esbuilder(config, true);
}

/** @param {Record<string, string>} [dict] */
export function replace(dict={}) {
	for (let key in dict) {
		dict[key] = String(dict[key]);
	}

	return esbuilder({ define: dict, loader: 'js' });
}
