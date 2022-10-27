<template>
  <div class="q-pa-md q-gutter-md row">
    <q-card class="q-pa-md">

      <!--   一堆按钮   -->
      <q-card-section class="q-pa-md q-gutter-md">
        <q-btn label="刷新" icon="refresh" color="blue-14" :loading="secondTitleRefreshBtnLoading"
               @click="refreshBtnHandler"/>
        <q-btn label="新增" icon="edit" color="secondary" @click="insertBtnHandler">
          <!--     新增按钮弹出dialog     -->
          <q-dialog v-model="showInsert">
            <q-card class="q-pa-md q-gutter-md">
              <!--       标题       -->
              <q-card-section class="row justify-between">
                <strong style="min-width: 233px">新增二级标题</strong>
                <q-btn icon="close" dense v-close-popup round flat/>
              </q-card-section>

              <!--       选择一级标题       -->
              <q-card-section>
                <q-btn-dropdown :label="firstTitleTitle" color="primary">
                  <q-list>
                    <q-item clickable v-for="item in headItems" v-close-popup
                            @click="selectedFirstTitle(item.label,item.id)">
                      <q-item-section>
                        {{ item.label }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </q-card-section>

              <!--       输入标题       -->
              <q-card-section>
                <q-input v-model="secondTitleTitle" label="二级标题"/>
              </q-card-section>

              <!--      优先级        -->
              <q-card-section>
                <q-input v-model="secondTitleOrder" label="优先级" type="number"/>
              </q-card-section>

              <!--       提交重置       -->
              <q-card-section class="row justify-between">
                <q-btn label="重置" icon="clear_all" color="secondary" @click="insertBtnHandler"/>
                <q-btn label="提交" icon="upload" color="primary" @click="commitSecondTitle"/>
              </q-card-section>
            </q-card>
          </q-dialog>
        </q-btn>
        <q-btn label="删除" icon="delete_forever" color="red" @click="deleteSelected"/>
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
                @before-show="beforeShowSecondTitle(props.row.title, props.row.id, props.row.order)"
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
                             @click="beforeShowSecondTitle(props.row.title, props.row.id, props.row.order)"
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
                @before-show="beforeShowSecondTitle(props.row.title, props.row.id, props.row.order)"
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
                             @click="beforeShowSecondTitle(props.row.title, props.row.id, props.row.order)"
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

      <!--     分页     -->
      <div class="q-pa-lg flex flex-center" v-if="pageTotal > 0">
        <q-pagination
          :max="pageTotal"
          direction-links
          boundary-numbers
          :max-pages="pageMax"
          v-model="currentPage"
          @click="getSecondTitle"
        />
      </div>

    </q-card>
  </div>
</template>

<script setup>

import {SECOND_TITLE_COLUMNS} from "components/user/table";
import {ref, watch} from "vue";
import {
  CODE_200,
  DEFAULT_DELAY,
  EMPTY_STRING,
  PAGE_MAX,
  PAGE_SIZE,
  START_PAGE,
  UNDEFINED,
  ZERO
} from "components/MagicValue";
import {api} from "boot/axios";
import {emptyToNull, getIdList, getRows, getSelectedString, init, sleep} from "components/Tools";
import {CommFail, CommSeccess, CommWarn, DeleteConform, DeleteConformNew} from "components/notifyTools";

// 分页
const pageMax = ref(PAGE_MAX);

// 删除
function deleteSelected() {
  DeleteConformNew(getIdList(secondTitleSelected.value), '/firstTitle', () => {
    getSecondTitle();
    resetSelected();
  });
}

// 重置选中
function resetSelected() {
  secondTitleSelected.value = [];
}

// 新增按钮
const showInsert = ref(false);

// 点击编辑按钮 重置
function insertBtnHandler() {
  resetFirstTitle();
  resetForm();
  showInsert.value = true;
}

// 上传二级标题
function commitSecondTitle() {
  if (firstTitleId.value === ZERO) {
    CommWarn("请选择一级标题");
    return;
  }
  api.post('/secondTitle', {
    firstTitleId: firstTitleId.value,
    title: secondTitleTitle.value,
    order: secondTitleOrder.value
  }).then(res => {
    CommSeccess("上传成功");
  }).catch(res => {
    CommFail("上传失败");
  }).then(res => {
    getSecondTitle();
  })
}

// 选择一级标题
const firstTitleTitle = ref(UNDEFINED);
const firstTitleId = ref(ZERO);

// 一级标题选中
function selectedFirstTitle(title, id) {
  firstTitleTitle.value = title;
  firstTitleId.value = id;
}

// 重置一级标题
function resetFirstTitle() {
  firstTitleTitle.value = UNDEFINED;
  firstTitleId.value = ZERO;
}

// 重置表单
function resetForm() {
  secondTitleTitle.value = EMPTY_STRING;
  secondTitleOrder.value = ZERO;
  secondTitleId.value = EMPTY_STRING;
}

const secondTitleRefreshBtnLoading = ref(false);

// 点击刷新按钮
async function refreshBtnHandler() {
  secondTitleRefreshBtnLoading.value = true;

  await getSecondTitle();
  await sleep(DEFAULT_DELAY);

  secondTitleRefreshBtnLoading.value = false;
}

const secondTitleTitle = ref(EMPTY_STRING);
const secondTitleId = ref(EMPTY_STRING);
const secondTitleOrder = ref(ZERO);

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
    getSecondTitle();
  })
}

// 预处理
function beforeShowSecondTitle(title, id, order) {
  secondTitleOrder.value = order;
  secondTitleTitle.value = title;
  secondTitleId.value = id;
}

// 获取二级标题
async function getSecondTitle() {
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
  getSecondTitle();
}

const headItems = ref([]);

init(headItems, start);
</script>

<style scoped>

</style>
