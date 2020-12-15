<script lang="ts">
	export let value: number;
	$: double = (value ?? 0) * 2;
</script>

<div>{value} {'&times;'} 2 = {double}</div>
