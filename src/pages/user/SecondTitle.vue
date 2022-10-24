<template>
  <div class="q-pa-md q-gutter-md row">
    <q-card class="q-pa-md">

      <!--   一堆按钮   -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" icon="refresh" color="blue-14"/>
      </q-card-section>

      <!--   表   -->
      <q-card-section>

        <!--    表    -->
        <q-table title="一级标题" :columns="SECOND_TITLE_COLUMNS" :rows="secondTitleRows" row-key="id"
                 hide-pagination selection="multiple" v-model:selected="secondTitleSelected"
                 :loading="secondTitleLoading" :pagination="secondTitlePagination"
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
                    <q-input v-model="secondTitleTitle" dense autofocus v-close-popup
                             @keyup.enter="updateSecondTitleHandler"/>

                    <!--           提交重置按钮           -->
                    <div class="row justify-between">
                      <q-btn class="col-auto"
                             @click="beforeShowFirstTitle(props.row.title, props.row.id, props.row.order)"
                             color="secondary" label="重置"/>
                      <q-btn class="col-auto" @click="updateSecondTitleHandler" color="primary"
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
                    <q-input v-model="secondTitleOrder" dense autofocus type="number"/>

                    <!--           提交重置按钮           -->
                    <div class="row justify-between">
                      <q-btn class="col-auto"
                             @click="beforeShowFirstTitle(props.row.title, props.row.id, props.row.order)"
                             color="secondary" label="重置"/>
                      <q-btn class="col-auto" @click="updateSecondTitleHandler" color="primary"
                             label="提交" v-close-popup/>
                    </div>
                  </div>
                </transition>
              </q-popup-edit>
            </q-td>
          </template>
        </q-table>

        <!--     加载     -->
        <q-inner-loading :showing="secondTitleLoading">
          <q-spinner-gears size="50px" color="primary"/>
        </q-inner-loading>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>

import {FIRST_TITLE_COLUMNS, SECOND_TITLE_COLUMNS} from "components/user/table";
import {ref} from "vue";
import {EMPTY_STRING, PAGE_SIZE, START_PAGE} from "components/MagicValue";
import {api} from "boot/axios";
import {emptyToNull, getRows, getSelectedString, init} from "components/Tools";
import {CommFail, CommSeccess} from "components/notifyTools";

const secondTitleTitle = ref(EMPTY_STRING);
const secondTitleId = ref(EMPTY_STRING);
const secondTitleOrder = ref(EMPTY_STRING);

const secondTitleSelected = ref([]);
const secondTitlePageSize = ref(PAGE_SIZE);
const secondTitleRows = ref([]);
const secondTitleLoading = ref(true);
const secondTitlePagination = ref({rowsPerPage: secondTitlePageSize.value});
const currentPage = ref(START_PAGE);
const pageTotal = ref(3);

// 修改二级标题
function updateSecondTitleHandler() {
  api.put('/secondTitle', {
    id: emptyToNull(secondTitleId.value),
    title: emptyToNull(secondTitleTitle.value),
    order: emptyToNull(secondTitleOrder.value)
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
  secondTitleOrder.value = order;
  secondTitleTitle.value = title;
  secondTitleId.value = id;
}

// 获取二级标题
async function getFirstTitle() {
  secondTitleLoading.value = true;

  await api.get('/secondTitle', {
    params: {
      currentPage: currentPage.value,
      pageSize: secondTitlePageSize.value
    }
  }).then(res => {
    const lists = res.data.lists;
    const total = res.data.total;

    secondTitleRows.value = getRows(lists, SECOND_TITLE_COLUMNS);
    pageTotal.value = Math.ceil(total / secondTitlePageSize.value);
  })

  secondTitleLoading.value = false;
}

function start() {
  getFirstTitle();
}

init(start);
</script>

<style scoped>

</style>
