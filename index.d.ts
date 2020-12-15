import type { TransformOptions } from 'esbuild';
import type { Preprocessor } from 'svelte/types/compiler/preprocess';

export type Definitions = {
	[find: string]: string;
}

type Allow = Pick<TransformOptions, 'avoidTDZ'|'banner'|'charset'|'define'|'footer'|'keepNames'|'pure'|'target'|'treeShaking'|'tsconfigRaw'>;

// export interface Options extends Omit<TransformOptions, 'logLevel'|'color'|'minify'|'jsxFactory'|'jsxFragment'|'color'|'logLevel'|'errorLimit'> {
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

/** @note Use `options.define` for replacements */
export function typescript(options?: Options): { script: Preprocessor };

/** @note Only works with JavaScript! */
export function replace(values: Definitions): { script: Preprocessor };
