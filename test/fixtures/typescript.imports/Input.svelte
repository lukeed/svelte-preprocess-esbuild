<script lang="ts">
	import Counter from './Counter.svelte';
	import { capitalize } from './utils';
	import {
		hello, world,
		howdy
	} from 'foobar';

	export let name: string = 'hello';
	export const value = hello() + world();
</script>

<div>{capitalize(name)}</div>
<Counter {value} />
