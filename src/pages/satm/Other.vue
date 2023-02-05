<template>
  <div class="q-pa-lg">
    <!-- 标题   -->
    <div class="full-width text-primary text-h4 text-center cursor-pointer">
      <strong>
        {{ field }}
      </strong>
    </div>

    <!--  沿用之前的  -->
    <MainPage :first-index="index"/>
  </div>
</template>

<script setup lang="ts">

import {useRoute, useRouter} from "vue-router";
import {ref, watch} from "vue";
import ListItem from "../../components/satm/ListItem.vue";
import {Head} from "../../components/main/head-item";
import {init} from "../../components/Tools";
import {useQuasar} from "quasar";
import MainPage from "../main/MainPage.vue";

// 刀
const $q = useQuasar();
const $route = useRoute();
const $router = useRouter();

// 索引
const index = ref(0);

// 领域
const field = ref($route.query.field);

// 找到索引
function getIndex(field): number {
  return headItems.value.findIndex(item => field == item.label);
}

// 开始
function start() {
  field.value = $route.query.field;
  index.value = getIndex(field.value);
  // 遣返山姆·波特·布里吉斯
  index.value || $router.push('/satm');
}

// 监控路径
watch(() => $route.query.field, () => {
  start();
})

// 头
const headItems = ref([] as Head[]);

init(headItems, start);
</script>

<style scoped>

.gird-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
}

</style>