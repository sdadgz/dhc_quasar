<template>
  <div class="q-pa-md row">

    <!--   注册海克斯科技用户   -->
    <q-card class="q-pa-md" style="width: 460px;">

      <!--    标题    -->
      <q-card-section>
        <strong>注册新用户</strong>
      </q-card-section>

      <!--    用户名    -->
      <q-card-section>
        <q-input v-model="registerUsername" label="用户名" :rules="notNull"/>
      </q-card-section>

      <!--    密码    -->
      <q-card-section>
        <q-input v-model="registerPassword" label="密码" :rules="notNull" type="password"/>
      </q-card-section>

      <!--    确认密码    -->
      <q-card-section>
        <q-input v-model="registerPasswordP" label="确认密码" :rules="sameRule" type="password"/>
      </q-card-section>

      <!--    按钮    -->
      <q-card-section class="row justify-between">
        <q-btn label="重置" icon="clear_all" color="secondary" @click="resetRegister"/>
        <q-btn label="提交" icon="upload" color="primary" @click="commitRegister"/>
      </q-card-section>
    </q-card>

  </div>
</template>

<script setup>

import {ref} from "vue";
import {EMPTY_STRING} from "components/MagicValue";
import {notNull} from "components/Tools";
import {CommFail, CommSeccess, CommWarn} from "components/notifyTools";
import {api} from "boot/axios";

const registerUsername = ref(EMPTY_STRING);
const registerPassword = ref(EMPTY_STRING);
const registerPasswordP = ref(EMPTY_STRING);
const sameRule = ref([(val) => (val && val === registerPassword.value && val.length > 0)
  || '两次输入的密码不同'])

// 重置注册
function resetRegister() {
  registerUsername.value = EMPTY_STRING;
  registerPassword.value = EMPTY_STRING;
  registerPasswordP.value = EMPTY_STRING;
}

// 提交注册
function commitRegister() {
  if (registerUsername.value.length < 1 || registerPassword.value.length < 1 ||
    registerPasswordP.value !== registerPassword.value) {
    CommWarn("请完善表单");
    return;
  }

  api.post('/user/register', {
    name: registerUsername.value,
    password: registerPassword.value
  }).then(res => {
    CommSeccess("注册成功");
  }).catch(res => {
    CommFail("注册失败");
  }).then(res => {
    resetRegister();
  })
}


</script>

<style scoped>

</style>
