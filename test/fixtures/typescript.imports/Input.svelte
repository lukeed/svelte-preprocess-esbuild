<script lang="ts">
	import Counter from './Counter.svelte';
	import { capitalize } from './utils';
	import type { Readable } from 'svelte/store';
	import {
		hello, world,
		howdy
	} from 'foobar';

	export let name: string = 'hello';
	export const value = hello() + world();
</script>

<div>{capitalize(name)}</div>
<Counter {value} />
