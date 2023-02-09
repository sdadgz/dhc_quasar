<template>
  <q-layout view="lHh Lpr lFf" style="background-color: #eff3f9">
    <!--  头部  -->
    <q-header>
      <q-toolbar>
        <q-btn
            icon="menu"
            flat
            round
            dense
            class="q-mr-sm"
            @click="drawer = !drawer;True = true"
        />

        <!--    面包屑    -->
        <q-breadcrumbs style="font-size: 18px">
          <q-breadcrumbs-el style="color: white;margin-left: 20px" label="后台管理系统"
                            @click="to(EMPTY_STRING)" class="cursor-pointer"/>
          <q-breadcrumbs-el :label="subTitle"/>
        </q-breadcrumbs>

        <!--    回家    -->
        <q-space/>
        <q-btn icon="home" label="回到首页" flat @click="goHome"/>
        <q-btn icon="logout" label="退出登录" flat @click="logout"/>
      </q-toolbar>
    </q-header>

    <!--  左侧  -->
    <q-drawer
        v-model="True" :mini="drawer ? !drawerHover : false" :width="250"
        @mouseover="drawerHover = false;" @mouseout="drawerHover = false"
        :mini-to-overlay="drawer ? drawerHover : false"
        class="overflow-hidden"
    >
      <q-img style="margin-top: 15px" :src="logoUrl" width="250px"/>
      <q-list>
        <!--    遍历    -->
        <q-item v-for="item in drawerList" clickable v-ripple @click="to(item.url)"
                :style="{backgroundColor: item.selected ? '#fafafa' : '',borderRight: item.selected ?
                '3px solid #007bff' : ''}">
          <q-item-section avatar>
            <q-icon :name="item.icon" :color="item.selected ? 'blue' : ''"/>
          </q-item-section>

          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script setup>

import {ref, watch} from "vue";
import {SERVER_NAME, STATIC_SRC} from "components/Models";
import {useRoute, useRouter} from "vue-router";
import {EMPTY_STRING, HOME, LEVER} from "components/MagicValue";
import {DRAWER_LIST} from "components/user/DrawerList";

const $route = useRoute();
const $router = useRouter();

const baseUrl = ref('/user'); // 需要修改

const drawerList = ref(DRAWER_LIST);
const drawer = ref(false);
const True = ref(true);
const drawerHover = ref(false);
const logoUrl = ref(SERVER_NAME + STATIC_SRC + 'cms_logo.png');
const subTitle = ref(EMPTY_STRING);

// 回家
function goHome() {
  $router.push(HOME);
}

// 退出登录
function logout(){
  localStorage.removeItem("token");
  $router.push('/user/login');
}

// 跳转到
function to(second) {
  $router.push(baseUrl.value + LEVER + second);
}

// 设置选中状态
function setSelected() {
  const split = $route.path.split('/');
  const str = split[2];
  drawerList.value.forEach(item => {
    const b = item.url === str;
    if (b) {
      subTitle.value = item.label;
    }
    item.selected = b;
  })
}

watch(() => $route.fullPath, () => {
  setSelected();
}, {immediate: true})
</script>

<style scoped>

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
