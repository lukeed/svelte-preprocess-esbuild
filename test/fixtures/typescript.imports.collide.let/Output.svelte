<script lang="ts">import { count } from "./data";
let data;
$: {
  data = count * 2;
}
</script>
