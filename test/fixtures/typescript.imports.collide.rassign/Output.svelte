<script lang="ts">import {count} from "./data";
$:
  data = count + 1;
</script>

<div class="counter">
  <button on:click={() => data--}> - </button>
  <span>{ data }</span>
  <button on:click={() => data++}> + </button>
</div>
