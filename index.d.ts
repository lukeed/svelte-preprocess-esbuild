import type { TransformOptions } from 'esbuild';
import type { Preprocessor } from 'svelte/types/compiler/preprocess';

export interface Options extends Omit<TransformOptions, 'logLevel'|'color'|'jsxFactory'|'jsxFragment'|'color'|'logLevel'|'errorLimit'> {
	/** @default 'tsconfig.json' */
	tsconfig: string;
	/** @default true */
	sourcemap?: boolean | 'inline';
	/** @default false */
	minify?: boolean;
	/** @default 'esm' */
	format?: 'esm' | 'cjs';
	/** @default 'utf8' */
	charset?: TransformOptions['charset'];
	/** @default 'error' */
	loglevel?: TransformOptions['logLevel'];
}

export function typescript(options?: Options): { script: Preprocessor };
export function replace(values: Record<string, string>): { script: Preprocessor };
