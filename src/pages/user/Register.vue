<template>
  <div class="q-pa-md row q-gutter-md">

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

    <!--  用户表  -->
    <q-card class="q-pa-md">
      <q-table title="用户" :columns="userColumns" :rows="userRows" row-key="id" hide-pagination
               selection="multiple" v-model:selected="userSelected" :loading="userLoading"
               :selected-rows-label="getSelectedString" :pagination="userPagination">

        <template #body-cell-name="props">
          <q-td :props="props" class="cursor-pointer" title="点击编辑">
            {{ props.row.name }}
            <q-popup-edit
              v-model="props.row.name"
              v-slot="scope"
              title="修改标题"
              @before-show="beforeShowUsernameHandler(props.row.name, props.row.id)"
            >
              <transition
                appear
                enter-active-class="animated zoomIn"
                leave-active-class="animated zoomOut"
              >
                <div class="q-pa-md q-gutter-md">
                  <q-input v-model="nameInput" dense autofocus @keyup.enter="updateUsernameHandler"
                           v-close-popup/>

                  <!--           提交重置按钮           -->
                  <div class="row justify-between">
                    <q-btn class="col-auto"
                           @click="beforeShowUsernameHandler(props.row.name, props.row.id)"
                           color="secondary" label="重置"/>
                    <q-btn class="col-auto" @click="updateUsernameHandler" color="primary"
                           label="提交" v-close-popup/>
                  </div>
                </div>
              </transition>
            </q-popup-edit>
          </q-td>
        </template>

      </q-table>


      <!--     加载     -->
      <q-inner-loading :showing="userLoading">
        <q-spinner-gears size="50px" color="primary"/>
      </q-inner-loading>
    </q-card>
  </div>
</template>

<script setup>

import {ref} from "vue";
import {EMPTY_STRING, PAGE_SIZE, START_PAGE} from "components/MagicValue";
import {getRows, getSelectedString, init, notNull} from "components/Tools";
import {CommFail, CommSeccess, CommWarn} from "components/notifyTools";
import {api} from "boot/axios";
import {USER_COLUMNS} from "components/user/table";

const nameInput = ref(EMPTY_STRING);
const userId = ref(EMPTY_STRING);

// 点击用户表名字预处理
function beforeShowUsernameHandler(name, id) {
  nameInput.value = name;
  userId.value = id;
}

// 修改用户表名字
function updateUsernameHandler() {
  api.put('/user/update', {
    name: nameInput.value,
    id: userId.value
  }).then(res => {
    CommSeccess("修改成功");
  }).catch(res => {
    CommFail("修改失败");
  }).then(res => {
    getUser();
  })
}

const pageSize = ref(PAGE_SIZE);
const userPagination = ref({rowsPerPage: pageSize.value});
const userLoading = ref(true);
const userColumns = ref(USER_COLUMNS);
const userRows = ref([]);
const userSelected = ref([]);
const registerUsername = ref(EMPTY_STRING);
const registerPassword = ref(EMPTY_STRING);
const registerPasswordP = ref(EMPTY_STRING);
const sameRule = ref([(val) => (val && val === registerPassword.value && val.length > 0)
  || '两次输入的密码不同']);
const currentPage = ref(START_PAGE);
const pageTotal = ref(4);
const name = ref(EMPTY_STRING);

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
    getUser();
  })
}

// 获取user
async function getUser() {
  userLoading.value = true;
  await api.get('/user/page', {
    params: {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      name: name.value === EMPTY_STRING ? null : name.value
    }
  }).then(res => {
    const dataLists = res.data.lists;
    const dataTotal = res.data.total;

    userRows.value = getRows(dataLists, USER_COLUMNS);
    pageTotal.value = Math.ceil(dataTotal / pageSize.value);
  })
  userLoading.value = false;
}

function start() {
  getUser();
}

const headItems = ref([]);

init(start, headItems);
</script>

<style scoped>

</style>
