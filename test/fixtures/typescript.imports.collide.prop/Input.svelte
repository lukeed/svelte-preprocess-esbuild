<script lang="ts">
  import { count } from './data';
	export let data = count;
</script>

<div class="counter">
  <button on:click={() => data--}> - </button>
  <span>{ data }</span>
  <button on:click={() => data++}> + </button>
</div>
