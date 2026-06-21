<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <article class="doc-content" v-html="content" />
</template>

<style scoped>
.doc-content {
  /* Let the parent container control width — no hard max-width here */
  width: 100%;
}
</style>
