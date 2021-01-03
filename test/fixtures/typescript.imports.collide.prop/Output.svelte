<script lang="ts">import {count} from "./data";
let data = count;
export {
  data
};
</script>

<div class="counter">
  <button on:click={() => data--}> - </button>
  <span>{ data }</span>
  <button on:click={() => data++}> + </button>
</div>
