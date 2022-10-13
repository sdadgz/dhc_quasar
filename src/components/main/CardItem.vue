<template>
<div class="cont row">
  <div class="full-width col row justify-between" style="margin-bottom: 10px">
    <span class="title">友情连接</span>
    <span class="sub-title" @click="goto">更多>></span>
  </div>
</div>
</template>

<script setup>

import {HEAD_ITEMS} from "components/main/head-item";
import {ESSAY_UNIQUE_ID, LEVER} from "components/MagicValue";
import {useRouter} from "vue-router";

const $router = useRouter();

function goto() {
  const lastIndex = HEAD_ITEMS[0].children.length - 1;
  const second = HEAD_ITEMS[0].children[lastIndex].label;
  let routeUrl = $router.resolve({
    path: '/' + HEAD_ITEMS[0].label + LEVER + second,
  })
  window.open(routeUrl.href, '_blank');
}

</script>

<style scoped>

.sub-title {
  font-weight: bold;
  margin-top: 8px;
  color: #125ca8;
  cursor: pointer;
  font-size: 14px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #125ca8;
}

.cont {
  width: 100%;
  margin: 0;
  padding: 30px 25px 25px;
}

</style>
