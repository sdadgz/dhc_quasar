<template>
  <div class="q-pa-md q-gutter-md row">
    <q-card class="q-pa-md">

      <!--   一堆按钮   -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" icon="refresh" color="blue-14" :loading="firstTitleRefreshBtnLoading"
               @click="refreshBtnHandler"/>
        <q-btn label="新增" icon="edit" color="secondary" @click="beforeShow">
          <q-dialog v-model="insertShow">
            <q-card class="q-pa-md q-gutter-md">
              <!--       标题       -->
              <q-card-section class="row justify-between">
                <strong>新增一级标题</strong>
                <q-btn icon="close" dense round flat v-close-popup/>
              </q-card-section>

              <!--       标题输入       -->
              <q-card-section>
                <q-input v-model="firstTitleTitle" label="一级标题名字" style="min-width: 250px"
                         @keyup.enter="commitFirstTitle"/>
              </q-card-section>

              <!--       优先级       -->
              <q-card-section>
                <q-input v-model="firstTitleOrder" label="优先级" type="number"/>
              </q-card-section>

              <!--      俩按钮        -->
              <q-card-section class="row justify-between">
                <q-btn label="重置" color="secondary" @click="resetFirstTitleForm"/>
                <q-btn label="提交" color="primary" @click="commitFirstTitle"/>
              </q-card-section>
            </q-card>
          </q-dialog>
        </q-btn>
      </q-card-section>

      <!--   表   -->
      <q-card-section>

        <!--    表    -->
        <q-table title="一级标题" :columns="FIRST_TITLE_COLUMNS" :rows="firstTitleRows" row-key="id"
                 hide-pagination selection="multiple" v-model:selected="firstTitleSelected"
                 :loading="firstTitleLoading" :pagination="firstTitlePagination"
                 :selected-rows-label="getSelectedString">

          <!--     标题     -->
          <template #body-cell-title="props">
            <q-td :props="props" title="点击编辑" class="cursor-pointer">
              {{ props.row.title }}
              <q-popup-edit
                v-model="props.row.title"
                v-slot="scope"
                title="修改标题"
                @before-show="beforeShowFirstTitle(props.row.title, props.row.id, props.row.order)"
              >
                <transition
                  appear
                  enter-active-class="animated zoomIn"
                  leave-active-class="animated zoomOut"
                >
                  <div class="q-pa-md q-gutter-md">
                    <q-input v-model="firstTitleTitle" dense autofocus v-close-popup
                             @keyup.enter="updateFirstTitleHandler"/>

                    <!--           提交重置按钮           -->
                    <div class="row justify-between">
                      <q-btn class="col-auto"
                             @click="beforeShowFirstTitle(props.row.title, props.row.id, props.row.order)"
                             color="secondary" label="重置"/>
                      <q-btn class="col-auto" @click="updateFirstTitleHandler" color="primary"
                             label="提交" v-close-popup/>
                    </div>
                  </div>
                </transition>
              </q-popup-edit>
            </q-td>
          </template>

          <!--     排序     -->
          <template #body-cell-order="props">
            <q-td :props="props" class="cursor-pointer" title="点击编辑">
              {{ props.row.order }}
              <q-popup-edit
                v-model="props.row.order"
                v-slot="scope"
                title="修改标题"
                @before-show="beforeShowFirstTitle(props.row.title, props.row.id, props.row.order)"
              >
                <transition
                  appear
                  enter-active-class="animated zoomIn"
                  leave-active-class="animated zoomOut"
                >
                  <div class="q-pa-md q-gutter-md">
                    <q-input v-model="firstTitleOrder" dense autofocus type="number"/>

                    <!--           提交重置按钮           -->
                    <div class="row justify-between">
                      <q-btn class="col-auto"
                             @click="beforeShowFirstTitle(props.row.title, props.row.id, props.row.order)"
                             color="secondary" label="重置"/>
                      <q-btn class="col-auto" @click="updateFirstTitleHandler" color="primary"
                             label="提交" v-close-popup/>
                    </div>
                  </div>
                </transition>
              </q-popup-edit>
            </q-td>
          </template>
        </q-table>

        <!--     加载     -->
        <q-inner-loading :showing="firstTitleLoading">
          <q-spinner-gears size="50px" color="primary"/>
        </q-inner-loading>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>

import {ref} from "vue";
import {FIRST_TITLE_COLUMNS} from "components/user/table";
import {emptyToNull, getRows, getSelectedString, init, sleep} from "components/Tools";
import {DEFAULT_DELAY, EMPTY_STRING, PAGE_SIZE, START_PAGE, ZERO} from "components/MagicValue";
import {api} from "boot/axios";
import {CommFail, CommSeccess} from "components/notifyTools";

const insertShow = ref(false);

// 新增窗口预处理
function beforeShow() {
  resetFirstTitleForm();
  insertShow.value = true;
}

// 重置表单
function resetFirstTitleForm() {
  firstTitleId.value = EMPTY_STRING;
  firstTitleOrder.value = ZERO;
  firstTitleTitle.value = EMPTY_STRING;
}

// 提交表单
function commitFirstTitle() {
  api.post('/firstTitle', {
    title: firstTitleTitle.value,
    order: firstTitleOrder.value
  }).then(res => {
    CommSeccess("上传成功");
  }).catch(res => {
    CommFail("上传失败");
  }).then(res => {
    resetFirstTitleForm();
    getFirstTitle();
  })
}

const firstTitleRefreshBtnLoading = ref(false);

// 点击刷新按钮
async function refreshBtnHandler() {
  firstTitleRefreshBtnLoading.value = true;

  await getFirstTitle();
  await sleep(DEFAULT_DELAY);

  firstTitleRefreshBtnLoading.value = false;
}

const firstTitleTitle = ref(EMPTY_STRING);
const firstTitleId = ref(EMPTY_STRING);
const firstTitleOrder = ref(ZERO);

// 修改一级标题
function updateFirstTitleHandler() {
  api.put('firstTitle', {
    id: emptyToNull(firstTitleId.value),
    title: emptyToNull(firstTitleTitle.value),
    order: emptyToNull(firstTitleOrder.value.toString())
  }).then(res => {
    CommSeccess("修改成功");
  }).catch(res => {
    CommFail("修改失败");
  }).then(res => {
    getFirstTitle();
  })
}

// 预处理
function beforeShowFirstTitle(title, id, order) {
  firstTitleOrder.value = order;
  firstTitleTitle.value = title;
  firstTitleId.value = id;
}

const firstTitlePageSize = ref(PAGE_SIZE);
const firstTitleRows = ref([]);
const firstTitleLoading = ref(true);
const firstTitleSelected = ref([]);
const firstTitlePagination = ref({rowsPerPage: firstTitlePageSize.value});
const currentPage = ref(START_PAGE);
const pageTotal = ref(3);

// 获取一级标题
async function getFirstTitle() {
  firstTitleLoading.value = true;

  await api.get('/firstTitle', {
    params: {
      currentPage: currentPage.value,
      pageSize: firstTitlePageSize.value
    }
  }).then(res => {
    const lists = res.data.lists;
    const total = res.data.total;

    firstTitleRows.value = getRows(lists, FIRST_TITLE_COLUMNS);
    pageTotal.value = Math.ceil(total / firstTitlePageSize.value);
  })

  firstTitleLoading.value = false;
}

function start() {
  getFirstTitle();
}

init(start);
</script>

<style scoped>

</style>
