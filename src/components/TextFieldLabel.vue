<template>
  <label class="pb-2 d-block">
    {{ label }}
    <span v-if="required" class="text-red pb-2">*</span>
  </label>
</template>

<script setup>
defineProps({
  label: String,
  required: Boolean
})

</script>