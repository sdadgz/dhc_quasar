<template>

</template>

<script setup>

import {useQuasar} from "quasar";
import {useRouter} from "vue-router";

// 刀
const $q = useQuasar();
const $router = useRouter();

// 入口
function start(){
  $router.push($q.platform.is.desktop && '/首页' || '/satm');
}

start();
</script>

<style scoped>

</style>