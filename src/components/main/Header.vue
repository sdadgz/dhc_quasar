<template>
  <div class="q-pa-md q-gutter-sm">
    <div class="container">
      <q-breadcrumbs separator=">">
        <q-breadcrumbs-el label="当前位置："/>
        <q-breadcrumbs-el class="super-link" :label="homeLabel" :to="home"/>
        <q-breadcrumbs-el v-if="firstLabel" class="super-link" :label="firstLabel" :to="firstTo"/>
        <q-breadcrumbs-el v-if="secondLabel" class="super-link" :label="secondLabel" :to="secondTo"/>
      </q-breadcrumbs>
    </div>
  </div>
</template>


<script setup>

import {useRoute, useRouter} from "vue-router";
import {ref, watch} from "vue";
import {init, sleep} from "components/Tools";
import {HOME, LEVER, POSITION_HOME, UNDEFINED} from "components/MagicValue";

// 刀
const $route = useRoute();
const $router = useRouter();

// 传参
const props = defineProps(['firstIndex']);

const show = ref(true);

// t0
const homeLabel = ref(POSITION_HOME);
const home = ref(HOME);
// t1
const firstLabel = ref();
const firstTo = ref(HOME);
// t2
const secondLabel = ref();
const secondTo = ref(HOME);

// 面包屑初始化
function breadInit() {
  firstLabel.value = $route.params.first;
  secondLabel.value = $route.params.second;
  // 屎山上拉屎
  if (props.firstIndex) {
    firstLabel.value = headItems.value[props.firstIndex].label;
  }

  firstTo.value = LEVER + firstLabel.value;
  secondTo.value = firstTo.value + LEVER + secondLabel.value;
}

// 初始化
function start() {
  breadInit();
}

// 监测路由是否变化
watch(() => $route.params, () => {
  start();
}, {immediate: true})

const headItems = ref([]);

init(headItems, start);
</script>


<style scoped>

.super-link {
  transition: all .2s ease-in-out;
}

.super-link:hover {
  color: #007eff;
  text-decoration: underline;
}

.container {
  margin: 0;
  font-size: 16px;
  color: #125ca8;
  font-weight: bold;
  padding: 15px 0;
}

span + span {
  margin-left: 10px;
}

</style>
