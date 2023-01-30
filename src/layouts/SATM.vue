<template>
  <q-layout view="hHh Lpr lFf">
    <!--  头  -->
    <q-header reveal-offset="250" elevated>
      <q-toolbar class="bg-red-5">
        <!--    菜单    -->
        <q-btn class="q-mr-sm" icon="menu" flat round dense/>
        <!--    标题    -->
        <q-toolbar-title>
          <span>石家庄市科技特派团</span>
          <span class="desktop-only q-ml-lg">石家庄市专精特新“小巨人”企业科技特派团</span>
        </q-toolbar-title>
        <!--    按钮    -->
        <q-btn label="登录" flat rounded @click="goLogin"/>
        <q-btn label="石家庄学院" flat rounded @click="goToSchool"/>
      </q-toolbar>
    </q-header>

    <q-page-container :class="$q.platform.is.desktop && 'q-px-lg'">
      <router-view/>
    </q-page-container>

    <!--  页脚  -->
    <q-footer>

    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {init} from "../components/Tools";
import {useRouter} from "vue-router";
import {api} from "../boot/axios";
import {useQuasar} from "quasar";

// 刀
const $q = useQuasar();
const $router = useRouter();

// 去登录页
function goLogin() {
  $router.push('/user');
}

// 去学校
function goToSchool() {
  window.open("https://www.sjzc.edu.cn/");
}

// 开始函数
function start() {

}

// 头
const headItems = ref([]);

// 初始化并获取headItems
init(headItems, start);
</script>

<style scoped>

</style>