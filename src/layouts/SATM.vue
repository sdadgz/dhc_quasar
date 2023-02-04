<template>
  <q-layout view="hHh Lpr lFf">
    <!--  头  -->
    <q-header :reveal-offset="250" elevated>
      <q-toolbar class="bg-red-5">
        <!--    菜单    -->
        <q-btn class="q-mr-sm" icon="menu" flat round dense/>
        <!--    标题    -->
        <q-toolbar-title>
          <span @click="goHome">石家庄市科技特派团</span>
          <span class="desktop-only q-ml-lg" @click="goHome">石家庄市专精特新“小巨人”企业科技特派团</span>
        </q-toolbar-title>
        <!--    按钮    -->
        <q-btn label="登录" flat rounded @click="goLogin"/>
        <q-btn label="石家庄学院" flat rounded @click="goToSchool"/>
      </q-toolbar>
    </q-header>

    <!-- todo 左侧drawer  -->
    <q-drawer>

    </q-drawer>

    <!--  内容  -->
    <q-page-container :class="$q.platform.is.desktop && 'q-px-lg'">
      <router-view/>
      <!--  页脚  -->
      <q-toolbar class="bg-red-5 row">
        <q-icon class="q-ma-lg cursor-pointer" :name="'img:' + footerIcon" size="5em" @click="goHome"/>
        <div class="col-md-2"/>
        <div class="col row q-my-lg" style="font-size: 1.1em">
          <span class="col-md-4 col-shrink q-mx-lg">承办单位：石家庄市科技特派团</span>
          <span class="col-md-4 col-shrink q-mx-lg">主办单位：石家庄学院</span>
          <span class="col-md-4 col-shrink q-mx-lg">电话：0311-66617215</span>
          <span class="col-md-4 col-shrink q-mx-lg">地址：石家庄市高新技术开发区珠峰大街288号</span>
        </div>
      </q-toolbar>
    </q-page-container>
  </q-layout>

  <!--  右下角体验旧版 -->
  <q-card class="fixed-bottom-right q-ma-lg cursor-pointer" @click="goOldHome">
    <q-card-section style="font-size: 0.8em;padding: 0.8em;line-height: 1">
      体验<br/>旧版
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {init} from "../components/Tools";
import {useRouter} from "vue-router";
import {api} from "../boot/axios";
import {useQuasar} from "quasar";
import {SERVER_NAME, SERVER_PREFIX, STATIC_SRC} from "../components/Models";

// 刀
const $q = useQuasar();
const $router = useRouter();

// 图标
const footerIcon = SERVER_NAME + STATIC_SRC + 'footer_icon.png';

// 回家
function goHome() {
  $router.push('/');
}

// 回老家
function goOldHome() {
  $router.push('/首页');
}

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

<style>

body {
  max-width: 2560px;
  margin: 0 auto;
}

</style>