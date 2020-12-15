<script lang="ts">let value;
$:
  double = (value ?? 0) * 2;
export {
  value
};
</script>

<div>{value} {'&times;'} 2 = {double}</div>
