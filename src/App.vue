<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useDocsStore } from '@/stores/docs'

useThemeStore()

const docsStore = useDocsStore()
docsStore.loadDocs()
</script>

<template>
  <!--
    Key by route.name instead of route.path:
    - Same page (e.g. DocDetail) navigating between docs stays MOUNTED
      and updates reactively → no white screen flash
    - Different pages (Home → Docs) still get destroyed/recreated correctly
  -->
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.name" />
    </Transition>
  </RouterView>
</template>

<style scoped>
/* Page transition defined in style.css */
</style>