<script lang="ts">import Counter from './Counter.svelte';
import { capitalize } from './utils';
import {
		hello, world,
		howdy
	} from 'foobar';
let name = "hello";
const value = hello() + world();
export {
  name,
  value
};
</script>

<div>{capitalize(name)}</div>
<Counter {value} />
