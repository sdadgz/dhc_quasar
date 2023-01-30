<template>
  <q-img class="rounded-borders cursor-pointer shadow-6" :src="props.img" :ratio="16/9"/>
  <div class="q-mt-xs">{{ props.label }}</div>
</template>

<script setup lang="ts">

import {ref} from "vue";

const props = defineProps(['img', 'label', 'essayId']);

</script>

<style scoped>

</style>