<script lang="ts">import {count} from "./data";
let value = count;
function data() {
  value++;
}
</script>

<div class="counter">
  <button on:click={() => value--}> - </button>
  <span>{ value }</span>
  <button on:click={data}> + </button>
</div>
