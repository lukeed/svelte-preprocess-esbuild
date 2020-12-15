import * as fs from 'fs';
import { suite } from 'uvu';
import { resolve } from 'path';
import * as assert from 'uvu/assert';
import * as svelte from 'svelte/compiler';
import * as processor from '../src';

// ---

const fixtures = resolve(__dirname, 'fixtures');

function load(fixture: string) {
	let filename = resolve(fixtures, fixture, 'App.svelte');
	if (!fs.existsSync(filename)) throw new Error(`Missing fixture: "${fixture}"`);
	let content = fs.readFileSync(filename, 'utf8');
	return { filename, content };
}

const read = (file: string) => fs.promises.readFile(file, 'utf8');
const normalize = (data: string) => data.replace(/(\r?\n)+/g, '\n');

// const preprocess: typeof svelte.preprocess = async (fixture: string, options) => {
// 	let { filename, content } = await load(fixture);
// 	return svelte.preprocess(content, options, { filename });
// };

// ---

const typescript = suite('exports.typescript');

typescript('should be a function', () => {
	assert.type(processor.typescript, 'function');
});

typescript('should return a preprocessor', () => {
	let output = processor.typescript();
	assert.type(output, 'object');
	assert.type(output.script, 'function');
	assert.type(output.markup, 'undefined');
	assert.type(output.style, 'undefined');
});

typescript.run();

// ---

const replace = suite('exports.replace');

replace('should be a function', () => {
	assert.type(processor.replace, 'function');
});

replace('should return a preprocessor', () => {
	let output = processor.replace();
	assert.type(output, 'object');
	assert.type(output.script, 'function');
	assert.type(output.markup, 'undefined');
	assert.type(output.style, 'undefined');
});

replace.run();

// ---

fs.readdirSync(fixtures).forEach(dir => {
	let test = suite(`fixtures/${dir}`);

	let options = resolve(fixtures, dir, 'config.ts');
	let { config } = require(options); // require hook

	test('should preprocess successfully', async () => {
		let input = resolve(fixtures, dir, 'Input.svelte');
		let output = resolve(fixtures, dir, 'Output.svelte');

		let source = await read(input);
		let result = await svelte.preprocess(source, [config], { filename: input });
		assert.type(result.map, 'object');
		assert.match(
			String(result.map),
			JSON.stringify(input)
		);
		assert.fixture(
			normalize(result.code),
			normalize(await read(output))
		);
	});

	test.run();
});
