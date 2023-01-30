<template>
  <q-img
      v-if="props.img"
      class="rounded-borders cursor-pointer shadow-6"
      :src="props.img"
      :ratio="16/9"
      @click="gotoEssay(props.essayId)"
  />
  <div class="q-mt-xs flex">{{ props.label }}</div>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";

// 刀
const $router = useRouter();

const props = defineProps(['img', 'label', 'essayId']);

// 点击轮播图
function gotoEssay(id: number | string) {
  $router.push('/satm/content?id=' + id);
}

</script>

<style scoped>

</style>