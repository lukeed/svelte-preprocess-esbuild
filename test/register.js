const { transformSync } = require('esbuild');

function transform(hook, source, filename) {
	const { code, warnings } = transformSync(source, {
		sourcefile: filename,
		format: 'cjs',
		loader: 'ts',
	});

	warnings.forEach(warning => {
		console.warn(`\nesbuild warning in ${filename}:`);
		console.warn(warning.location);
		console.warn(warning.text);
	});

	return hook(code, filename);
}

const loadJS = require.extensions['.js'];

// Runtime DOM hook for require("*.svelte") files
// Note: for SSR/Node.js hook, use `svelte/register`
require.extensions['.ts'] = function (mod, filename) {
	const orig = mod._compile.bind(mod);
	mod._compile = code => transform(orig, code, filename);
	loadJS(mod, filename);
}
