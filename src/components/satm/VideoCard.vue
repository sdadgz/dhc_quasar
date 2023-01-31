<template>
  <q-img
      v-if="props.img"
      class="rounded-borders cursor-pointer shadow-6"
      :src="props.img"
      :ratio="16/9"
      @mouseover="videoHover = true"
      @mouseout="videoHover = false"
      @click="gotoEssay(props.essayId)"
  >
    <!--  鼠标放上去显示个播放  -->
    <transition enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
      <q-btn v-show="videoHover" class="absolute-center" flat icon="smart_display" size="33px" style="color: rgba(161,13,35,0.84)"/>
    </transition>
  </q-img>
  <div class="q-mt-xs flex">{{ props.label }}</div>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {ref} from "vue";

// 传参
const props = defineProps(['img', 'label', 'essayId']);

// 刀
const $router = useRouter();

// 是否选中
const videoHover = ref(false);

// 点击轮播图
function gotoEssay(id: number | string) {
  $router.push('/satm/content?id=' + id);
}

</script>

<style scoped>

</style>