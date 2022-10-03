<template>
  <q-layout view="hHh Lpr fFf">

    <!--  通用头部  -->
    <header>
      <div style="min-width: 1200px;height: 200px">
        <!--    图片    -->
        <q-img :src="banner" class="full-width full-height">
          <div class="absolute-center head" style="background-color: unset">
            <!--      标题      -->
            <span class="cursor-pointer super-link" style="font-size: 44px;" @click="goHome">
              石家庄市数字医疗康复技术创新中心
            </span>
            <div class="float-right" style="width: 380px">
              <!--       头链接       -->
              <div class="head_list">
                <span @click="gotoLogin" class="super-link">登录</span>
                <span @click="gotoSchool" class="super-link">石家庄学院</span>
              </div>

              <!--       图片       -->
              <q-img :src="banner_text" style="margin-top: 40px;" class="float-right"/>

            </div>
          </div>
        </q-img>
      </div>
      <!--    面包屑    -->
      <div class="head-background row justify-center">
        <div class="width-1200 col-auto row justify-center">
          <div
            class="head-item col cursor-pointer text-white"
            v-for="i in HEAD_ITEMS.length"
            @mouseover="mouseOverMenu(HEAD_ITEMS[i-1])"
            @mouseout="mouseOutMenu"
            :style="headStyles[i-1]"
          >
            <!--      label      -->
            <div @click="headHandler(HEAD_ITEMS[i-1])">
              {{ HEAD_ITEMS[i - 1].label }}
            </div>
            <!--      下拉菜单      -->
            <q-slide-transition v-show="HEAD_ITEMS[i-1].label === hoverItem.label"
                                style="position: relative;top: -1.04%">
              <q-list dense bordered>
                <q-item clickable
                        style="z-index: 1"
                        class="head-background head-item"
                        dense
                        v-for="child in HEAD_ITEMS[i-1].children"
                        @mouseover="mouseOverMenu(HEAD_ITEMS[i-1])"
                        @mouseout="mouseOutMenu"
                        @click="sonHeadHandler(HEAD_ITEMS[i-1], child)"
                >
                  <q-item-section style="z-index: 1">{{ child.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-slide-transition>
          </div>
        </div>
      </div>
    </header>

    <!--  内容  -->
    <q-page-container>
      <router-view/>
    </q-page-container>

    <!--  页脚  -->
    <footer>

    </footer>
  </q-layout>
</template>

<script setup>

import {ref, watch} from "vue";
import {SERVER_NAME} from "components/Models";
import {useRoute, useRouter} from "vue-router";
import {HEAD_ITEMS, SELECT_COLOR, UNSELECT_COLOR} from "components/head-item";
import {HOME} from "components/MagicValue";

const $router = useRouter();
const $route = useRoute();

// 头部-图片
const banner = ref(SERVER_NAME + "/static/banner.png");
const banner_text = ref(SERVER_NAME + "/static/banner_text.png");
const school = ref("https://www.sjzc.edu.cn/");

// 头部-下拉菜单
const hoverItem = ref({label: ''});
const canReset = ref(false);
const headStyles = ref([]);

// 点击头部
async function headHandler(item) {
  await $router.push("/" + item.label);
}

// 子级头部点击
async function sonHeadHandler(father, son) {
  const path = "/" + father.label + "/" + son.label;
  await $router.push(path);
}

// 初始化
function start() {
  fixUrl(); // 纠错，首页特殊
  stylesInit(); // 头部样式初始化
}

// 路由纠错
function fixUrl() {
  const first = $route.params.first;
  const second = $route.params.second;

  // 错吧首页当成常人
  if (first === HEAD_ITEMS[0].label && !second) {
    $router.push("/" + HEAD_ITEMS[0].label);
    console.warn("允许范围内的警告：因地址栏是中文");
    return;
  }

  // 不存在的label当作url了\
  const fb = isExists(HEAD_ITEMS, first);
  if (fb) {
    // 一级匹配√
    const sb = isExists(fb, second);
    if (second && !sb) {
      goHome();
    }
  } else {
    // 一级对不上
    const path = $route.path;
    const split = path.split('/');
    // 首页特殊
    if (split[1] !== HEAD_ITEMS[0].label) {
      // 不是首页，遣返
      goHome();
    }
  }
}

// 列表中是否存在某值
function isExists(list, val) {
  for (let item of list) {
    if (item.label === val) {
      return item.children ? item.children : true;
    }
  }
  return false;
}

// 初始化样式数组
function stylesInit() {
  // 清空
  headStyles.value = [];
  // 天选之人是谁呢
  let selected = $route.params.first;
  if (!selected) {
    selected = HEAD_ITEMS[0].label;
  }
  // 初始化
  for (let i = 0; i < HEAD_ITEMS.length; i++) {
    if (selected === HEAD_ITEMS[i].label) {
      headStyles.value[i] = {backgroundColor: SELECT_COLOR};
      break;
    }
  }
}

// 鼠标悬浮-下拉菜单
function mouseOverMenu(item) {
  canReset.value = false;
  hoverItem.value = item;

  // 首页特殊不显示
  if (item.label === HEAD_ITEMS[0].label) {
    hoverItem.value = {label: ''};
  }
}

// 鼠标离开-下拉菜单
function mouseOutMenu() {
  // 设置允许删除
  canReset.value = true;

  setTimeout(() => {

    if (canReset.value) {
      hoverItem.value = {label: ''};
    }

  }, 233)

}

// 回到主页
function goHome() {
  $router.push(HOME);
}

// 去登录页
function gotoLogin() {
  $router.push("/user/login");
}

// 去石家庄学院官网
function gotoSchool() {
  window.open(school.value);
}

// 监控
watch(() => $route.path, () => {
  start();
}, {immediate: true})

start();

</script>

<style scoped>

.head-item {
  text-align: center;
  line-height: 50px;
  font-size: 16px;
  height: 50px;
  transition: all .2s ease-in-out;
}

.head-item:hover {
  background-color: #007eff;
}

.width-1200 {
  width: 1200px;
}

.head-background {
  background: #125ca8;
}

.head {
  width: 1200px;
  height: 200px;
  padding: 40px 0;
}

.head_list span {
  position: relative;
  padding: 0 8px;
  cursor: pointer;
}

.head_list span + span:after {
  content: "";
  display: block;
  width: 1px;
  height: 12px;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background: #fff;
}

.super-link {
  transition: all .2s ease-in-out;
}

.super-link:hover {
  color: rgb(17, 141, 241);
  text-decoration: underline;
}

</style>

<style>

body {
  overflow-y: auto;
  background-color: #eff3f9;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  background-color: #F5F5F5;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
  background-color: #018EE8;
}

</style>
