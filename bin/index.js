#!/usr/bin/env node
const { promisify } = require('util');
const { premove } = require('premove');
const { exec } = require('child_process');
const { readFile, writeFile } = require('fs');
const imports = require('rewrite-imports');
const pkg = require('../package.json');
const { dirname } = require('path');

const run = promisify(exec);
const read = promisify(readFile);
const write = promisify(writeFile);

function timer() {
	let start = process.hrtime();
	return () => {
		let [ss, ns] = process.hrtime(start);
		let ms = Math.round(ns / 1e6);
		return ss ? (ss + ms / 1e3).toFixed(2) + 's' : (ms + 'ms');
	};
}

(async function () {
	let outfile = pkg.exports['.'].import;
	let outdir = dirname(outfile);
	await premove(pkg.types);
	await premove(outdir);

	let t = timer(); // esm
	await run(`yarn esbuild src/index.ts --outfile=${outfile} --format=esm --platform=node --charset=utf8`);
	console.log('~> created "%s" file (%s)', outfile, t());

	t = timer(); // cjs
	let output = await read(outfile, 'utf8');
	await write(
		outfile = pkg.exports['.'].require,
		imports(output).replace('export {', 'module.exports = {')
	);
	console.log('~> created "%s" file (%s)', outfile, t());

	t = timer(); // types
	await run(`yarn tsc src/index.ts -d --declarationDir . --emitDeclarationOnly --allowSyntheticDefaultImports`);
	console.log('~> created "%s" file (%s)', pkg.types, t());
})().catch(err => {
	console.error('ERROR', err.stack || err);
	process.exit(1);
});
