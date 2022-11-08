<template>
  <div class="row">
    <!--  背景图  -->
    <div class="backgroundImg col-md-8 col-xs-0">
      <q-img :src="backgroundImg" class="full-height" position="0 0">
        <div class="left-bottom-title p-4">
          <span style="color: rgba(255,255,255,.5)">数字医疗康复技术创新中心</span>
        </div>
      </q-img>
    </div>

    <!--  右侧表单  -->
    <div class="col column justify-center">
      <!--   标题链接   -->
      <div class="col-auto row justify-center">
        <strong @click="gotoUser" class="super-link link col-auto"
                style="font-size: 14px">数字医疗康复技术创新中心后台</strong>
      </div>
      <!--   简介   -->
      <div class="col-auto row justify-center">
        <div class="small">请使用您的账号登录系统</div>
      </div>

      <!--   登录表单   -->
      <div class="col-auto column justify-center" style="margin: 50px">
        <!--    用户名    -->
        <div class="col-auto m-6">用户名</div>
        <div class="col-auto m-6">
          <q-input
            ref="usernameRef"
            v-model="username"
            :model-value="username"
            placeholder="清输入您的用户名"
            outlined
            square
            dense
            :rules="notNull"
            lazy-rules
            @keyup.enter="usernameEnter"
          />
        </div>

        <!--    密码    -->
        <div class="col-auto m-6">密码</div>
        <div class="col-auto m-6">
          <q-input
            ref="passwordRef"
            v-model="password"
            :model-value="password"
            placeholder="清输入您的密码"
            outlined
            square
            dense
            :rules="notNull"
            lazy-rules
            type="password"
            @keyup.enter="passwordEnter"
          />
        </div>
        <!--    登录按钮    -->
        <q-btn class="m-6" style="margin-top: 20px" @click="loginHandler" label="登录" color="primary" dense/>
      </div>

      <!--   最下面的一串东东   -->
      <div class="col-auto row justify-center">
        <span class="col-auto" style="color: #868e96;">Copyright © 2022 &nbsp;</span>
        <span @click="goHome" class="col-auto link super-link">数字医疗康复技术创新中心</span>
        <span class="col-auto" style="color: #868e96;">&nbsp; All right reserved</span>
      </div>
    </div>
  </div>
</template>

<script setup>

import {ref} from "vue";
import {SERVER_NAME} from "components/Models";
import {useRouter} from "vue-router";
import {api} from "boot/axios";
import {CommFail, CommSeccess, CommWarn} from "components/notifyTools";
import {HOME} from "components/MagicValue";

const $router = useRouter();

const backgroundImg = ref(SERVER_NAME + '/static/login_background.jpg'); // 背景图地址

const username = ref(localStorage.getItem("username"));
const usernameRef = ref(null);
const password = ref();
const passwordRef = ref(null);

// 用户名回车
function usernameEnter() {
  passwordRef.value.focus();
}

// 密码回车
function passwordEnter() {
  if (username.value && username.value.length > 0) {
    loginHandler();
  } else {
    CommWarn("请输入用户名");
    usernameRef.value.focus();
  }
}

// 数字医疗中心
function goHome() {
  $router.push(HOME);
}

// 后台管理系统
function gotoUser() {
  $router.push('/user');
}

// 登录按钮
function loginHandler() {

  if (!notNullFn(username.value) || !notNullFn(password.value)) {
    CommFail("输入值为空");
    return;
  }

  api.post("/user/login", {
    "name": username.value,
    "password": password.value
  }).then(res => {
    if (!res) {
      return;
    }
    CommSeccess("登录成功");

    const token = res.data.token;
    const databaseUsername = res.data.username;
    localStorage.setItem("token", token);
    localStorage.setItem("username", databaseUsername);

    // 到该去的地方
    gotoUser();
  })
}

const notNull = ref([(val) => (val && val.length > 0) || '输入值为空']);

// 规则
function notNullFn(str) {
  return str && str.length > 0;
}

</script>

<style scoped>

.small {
  font-size: 12px;
  color: #868e96;
  line-height: 1.72;
}

.link {
  color: #007eff;
  line-height: 1.72;
}

.super-link {
  transition: all .233s ease-in-out;
  cursor: pointer;
}

.super-link:hover {
  color: rgb(49, 143, 18);
}

.backgroundImg {
  height: 100vh;
  overflow: hidden;
}

.left-bottom-title {
  background-color: unset;
  position: absolute;
  bottom: 0;
}

.m-6 {
  margin: 6px;
}

.p-4 {
  padding: 4rem;
}

</style>
